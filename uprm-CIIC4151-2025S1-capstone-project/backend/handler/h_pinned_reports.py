# handler/h_pinned_reports.py
from flask import request, jsonify
from dao.d_pinned_reports import PinnedReportsDAO
from constants import HTTP_STATUS


class PinnedReportsHandler:
    def map_to_dict(self, pinned_report):
        """
        Map database result to dictionary.

        Expected pinned_report shapes:
          - (user_id, report_id, pinned_at)  # basic pinned_reports row
          - (user_id, report_id, pinned_at, title, description, status, category, created_at)  # from JOIN
        """
        if not pinned_report:
            return None

        # Basic fields
        mapped = {
            "user_id": pinned_report[0],
            "id": pinned_report[1],  # report id
            "pinned_at": pinned_report[2],
        }

        # If additional report fields exist (from JOIN), include them
        if len(pinned_report) > 3:
            mapped.update({
                "title": pinned_report[3] if len(pinned_report) > 3 else None,
                "description": pinned_report[4] if len(pinned_report) > 4 else None,
                "status": pinned_report[5] if len(pinned_report) > 5 else None,
                "category": pinned_report[6] if len(pinned_report) > 6 else None,
                "created_at": pinned_report[7] if len(pinned_report) > 7 else None,
            })

        return mapped

    def pin_report(self, data):
        """
        POST /pinned-reports
        Expects JSON: { "user_id": <int>, "report_id": <int> }
        Returns JSON with pinned: true on success.
        """
        try:
            if not data:
                return jsonify({"error_msg": "Missing data"}), HTTP_STATUS.BAD_REQUEST

            # Validate and coerce
            try:
                user_id = int(data.get("user_id"))
            except Exception:
                return jsonify({"error_msg": "user_id is required and must be an integer"}), HTTP_STATUS.BAD_REQUEST

            try:
                report_id = int(data.get("report_id"))
            except Exception:
                return jsonify({"error_msg": "report_id is required and must be an integer"}), HTTP_STATUS.BAD_REQUEST

            dao = PinnedReportsDAO()

            # Idempotent insert: dao.pin_report should already be implemented to ON CONFLICT DO NOTHING
            inserted = dao.pin_report(user_id, report_id)

            if inserted:
                # inserted is expected as (user_id, report_id, pinned_at)
                pinned_obj = {"user_id": inserted[0], "report_id": inserted[1], "pinned_at": inserted[2]}
                return jsonify({"success": True, "pinned": True, "pinned_obj": pinned_obj}), HTTP_STATUS.CREATED

            # Already pinned: still return success with pinned true
            return jsonify({"success": True, "pinned": True, "message": "Already pinned"}), HTTP_STATUS.OK

        except Exception as e:
            # Print stack/message for server logs (no app reference)
            print("pin_report exception:", e)
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def unpin_report(self, user_id, report_id):
        """
        DELETE /pinned-reports/<report_id>?user_id=<user_id>
        Returns JSON with pinned: false on success.
        """
        try:
            # Accept user_id passed directly or from request.args if None
            if user_id is None:
                raw_user = request.args.get("user_id")
                if raw_user is None:
                    return jsonify({"error_msg": "Missing user_id parameter", "pinned": False}), HTTP_STATUS.BAD_REQUEST
                try:
                    user_id = int(raw_user)
                except Exception:
                    return jsonify({"error_msg": "user_id must be an integer", "pinned": False}), HTTP_STATUS.BAD_REQUEST

            # report_id should be provided from the route; validate it
            try:
                report_id = int(report_id)
            except Exception:
                return jsonify({"error_msg": "report_id must be an integer", "pinned": False}), HTTP_STATUS.BAD_REQUEST

            dao = PinnedReportsDAO()

            # Try deleting directly (dao.unpin_report returns deleted row or None)
            deleted = dao.unpin_report(user_id, report_id)

            if deleted:
                # deleted expected as (user_id, report_id)
                return jsonify({
                    "success": True,
                    "pinned": False,
                    "user_id": deleted[0],
                    "report_id": deleted[1],
                    "message": "Unpinned"
                }), HTTP_STATUS.OK

            # Nothing to delete
            return jsonify({"success": False, "pinned": False, "error_msg": "Pinned report not found"}), HTTP_STATUS.NOT_FOUND

        except Exception as e:
            print("unpin_report exception:", e)
            return jsonify({"error_msg": str(e), "pinned": False}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_pinned_reports(self, user_id=None, page=1, limit=10):
        """
        GET /pinned-reports?user_id=<>&page=<>&limit=<>
        If user_id provided, returns that user's pinned reports; otherwise returns all.
        Paginated response with metadata.
        """
        try:
            offset = (page - 1) * limit
            dao = PinnedReportsDAO()

            if user_id:
                pinned_reports = dao.get_pinned_reports_by_user(user_id, limit, offset)
                total_count = dao.get_pinned_reports_count_by_user(user_id)
            else:
                pinned_reports = dao.get_all_pinned_reports(limit, offset)
                total_count = dao.get_total_pinned_reports_count()

            total_pages = (total_count + limit - 1) // limit
            pinned_reports_dict = [self.map_to_dict(pr) for pr in pinned_reports]

            return jsonify({
                "pinned_reports": pinned_reports_dict,
                "totalPages": total_pages,
                "currentPage": page,
                "totalCount": total_count,
                "user_id": user_id,
            }), HTTP_STATUS.OK

        except Exception as e:
            print("get_pinned_reports exception:", e)
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_user_pinned_reports(self, user_id, page=1, limit=10):
        try:
            if not user_id:
                return jsonify({"error_msg": "Missing user_id"}), HTTP_STATUS.BAD_REQUEST
            return self.get_pinned_reports(user_id, page, limit)
        except Exception as e:
            print("get_user_pinned_reports exception:", e)
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def check_pinned_status(self, user_id, report_id):
        """
        GET /reports/<report_id>/pinned-status?user_id=<>
        Returns { user_id, report_id, pinned: true/false }
        """
        try:
            if user_id is None or report_id is None:
                return jsonify({"error_msg": "Missing user_id or report_id"}), HTTP_STATUS.BAD_REQUEST

            # coerce to ints if possible
            try:
                user_id = int(user_id)
                report_id = int(report_id)
            except Exception:
                return jsonify({"error_msg": "user_id and report_id must be integers"}), HTTP_STATUS.BAD_REQUEST

            dao = PinnedReportsDAO()
            is_pinned = dao.is_report_pinned_by_user(user_id, report_id)

            return jsonify({
                "user_id": user_id,
                "report_id": report_id,
                "pinned": bool(is_pinned)
            }), HTTP_STATUS.OK

        except Exception as e:
            print("check_pinned_status exception:", e)
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_pinned_report_detail(self, user_id, report_id):
        """
        GET /pinned-reports/<user_id>/<report_id>/details
        Returns joined details about pinned report + report metadata.
        """
        try:
            if user_id is None or report_id is None:
                return jsonify({"error_msg": "Missing user_id or report_id"}), HTTP_STATUS.BAD_REQUEST

            try:
                user_id = int(user_id)
                report_id = int(report_id)
            except Exception:
                return jsonify({"error_msg": "user_id and report_id must be integers"}), HTTP_STATUS.BAD_REQUEST

            dao = PinnedReportsDAO()
            pinned_report = dao.get_pinned_report_details(user_id, report_id)

            if not pinned_report:
                return jsonify({"error_msg": "Pinned report not found"}), HTTP_STATUS.NOT_FOUND

            pinned_report_dict = self.map_to_dict(pinned_report)
            return jsonify(pinned_report_dict), HTTP_STATUS.OK

        except Exception as e:
            print("get_pinned_report_detail exception:", e)
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR
