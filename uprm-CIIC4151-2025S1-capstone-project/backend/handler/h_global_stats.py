from flask import Blueprint, jsonify, request
from dao.d_global_stats import GlobalStatsDAO
from constants import HTTP_STATUS
bp = Blueprint("global_stats", __name__)


class GlobalStatsHandler:
    @bp.get("/stats/summary")
    def summary(self):
        dao = GlobalStatsDAO()
        return jsonify({
          "avg_resolution_days": dao.avg_resolution_days(),
          "top_departments_resolved": dao.top_departments_resolved(5),
          "top_users_reports": dao.top_users_reports(5),
          "top_admins_validated": dao.top_admins_validated(5),
          "top_admins_resolved": dao.top_admins_resolved(5),
        })

    def get_resolution_rate_by_department(self):
        try:
            dao = GlobalStatsDAO()
            data = dao.resolution_rate_by_department()
            return jsonify(data), HTTP_STATUS.OK
        except Exception as e:
            print(f"[StatisticsHandler] Error in resolution_rate_by_department: {e}")
            return jsonify({"error": "Internal server error"}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    # ---------- /stats/avg-resolution-time-by-department ----------
    def get_avg_resolution_time_by_department(self):
        try:
            dao = GlobalStatsDAO()
            data = dao.avg_resolution_time_by_department()
            return jsonify(data), HTTP_STATUS.OK
        except Exception as e:
            print(f"[StatisticsHandler] Error in avg_resolution_time_by_department: {e}")
            return jsonify({"error": "Internal server error"}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    # ---------- /stats/monthly-report-volume?months=12 ----------
    def get_monthly_report_volume(self, months):
        try:
            dao = GlobalStatsDAO()
            data = dao.monthly_report_volume(months)
            return jsonify({
                "months": months,
                "data": data,
            }), HTTP_STATUS.OK

        except Exception as e:
            print(f"[StatisticsHandler] Error in monthly_report_volume: {e}")
            return jsonify({"error": "Internal server error"}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    # ---------- /stats/top-categories-percentage?n=5 ----------
    def get_top_categories_percentage(self, n):
        try:
            dao = GlobalStatsDAO()
            data = dao.top_categories_percentage(n)
            return jsonify({
                "limit": n,
                "data": data,
            }), HTTP_STATUS.OK

        except Exception as e:
            print(f"[StatisticsHandler] Error in top_categories_percentage: {e}")
            print(e)
            return jsonify({"error": "Internal server error"}), HTTP_STATUS.INTERNAL_SERVER_ERROR
        
