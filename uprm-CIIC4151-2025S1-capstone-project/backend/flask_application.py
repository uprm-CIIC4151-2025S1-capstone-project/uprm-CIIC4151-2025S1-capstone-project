from flask import Flask, request, jsonify, current_app, send_from_directory
from flask_cors import CORS

from handler.h_reports import ReportsHandler
from handler.h_users import UsersHandler
from handler.h_administrators import AdministratorsHandler
from handler.h_locations import LocationsHandler
from handler.h_departments import DepartmentsHandler
from handler.h_pinned_reports import PinnedReportsHandler
from handler.h_global_stats import GlobalStatsHandler

from constants import HTTP_STATUS
from dao.d_administrators import AdministratorsDAO

import os
import uuid
from pathlib import Path
from werkzeug.utils import secure_filename

# Allowed image types
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

# -------------------------------------------------------
# APP SETUP
# -------------------------------------------------------
app = Flask(__name__)
CORS(app)

# Upload folder setup
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_FOLDER = BASE_DIR / "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = str(UPLOAD_FOLDER)
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10 MB limit

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# -------------------------------------------------------
# HEALTH
# -------------------------------------------------------
@app.route("/", methods=["GET"]) # Ignored
def health_check():
    return {"status": "OK", "message": "Report System API is running"}


# -------------------------------------------------------
# IMAGE UPLOAD (NEW)
# -------------------------------------------------------
@app.route("/upload", methods=["POST"]) # Ignored
def upload_image():
    """
    Accepts: multipart/form-data with field "image"
    Saves the file into /uploads
    Returns: { "url": "/uploads/<uuid>.jpg" }
    """
    if "image" not in request.files:
        return jsonify({"error": "No image file part"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type"}), 400

    # secure original name and create unique file
    original_name = secure_filename(file.filename)
    ext = original_name.rsplit(".", 1)[1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"

    save_path = os.path.join(current_app.config["UPLOAD_FOLDER"], unique_name)
    file.save(save_path)

    # return URL accessible by frontend
    public_url = f"/uploads/{unique_name}"

    return jsonify({"url": public_url}), 201


# Serve uploaded files
@app.route("/uploads/<path:filename>") # Ignored
def uploaded_file(filename):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)


# -------------------------------------------------------
# REPORTS
# -------------------------------------------------------
@app.route("/reports", methods=["GET", "POST"]) # Done (create report not working)
def handle_reports():
    handler = ReportsHandler()
    if request.method == "POST":
        return handler.create_report(request.json)
    elif request.method == "GET":
        page = request.args.get("page", default=1, type=int)
        limit = request.args.get("limit", default=10, type=int)
        sort = request.args.get("sort")
        admin_id = request.args.get("admin_id", type=int)
        location_id = request.args.get("location_id", type=int)
        city = request.args.get("city")  # e.g. "Carolina"
        return handler.get_all_reports(page, limit, sort, admin_id, location_id, city)


@app.route("/reports/<int:report_id>", methods=["GET", "PUT", "DELETE"]) # Done (for PUT refer to 'change_report_status')
def handle_report(report_id):
    handler = ReportsHandler()
    if request.method == "GET":
        return handler.get_report_by_id(report_id)
    elif request.method == "PUT":
        return handler.update_report(report_id, request.json)
    elif request.method == "DELETE":
        return handler.delete_report(report_id)



@app.route("/reports/<int:report_id>/validate", methods=["POST"]) # Ignored
def validate_report(report_id):
    handler = ReportsHandler()
    return handler.validate_report(report_id, request.json)



@app.route("/reports/<int:report_id>/resolve", methods=["POST"]) # Ignored?
def resolve_report(report_id):
    handler = ReportsHandler()
    return handler.resolve_report(report_id, request.json)



@app.route("/reports/<int:report_id>/rate", methods=["POST"]) # Ignored (refer to 'toggle_rate_report')
def rate_report(report_id):
    handler = ReportsHandler()
    return handler.rate_report(report_id, request.json)


# -------------------------------------------------------
# REPORTS - RATING & STATUS ENHANCEMENTS
# -------------------------------------------------------
@app.route("/reports/<int:report_id>/rating-status", methods=["GET"]) # Ignored
def get_report_rating_status(report_id):
    handler = ReportsHandler()
    user_id = request.args.get("user_id", type=int)
    return handler.get_report_rating_status(report_id, user_id)


@app.route("/reports/<int:report_id>/rating", methods=["GET"]) # Done
def get_report_rating(report_id):
    handler = ReportsHandler()
    return handler.get_report_rating(report_id)


@app.route("/reports/<int:report_id>/status", methods=["PUT"]) # Done
def change_report_status(report_id):
    handler = ReportsHandler()
    return handler.change_report_status(report_id, request.json)


@app.route("/reports/status-options", methods=["GET"]) # Ignored
def get_status_options():
    handler = ReportsHandler()
    return handler.get_status_options()



# -------------------------------------------------------
# USERS
# -------------------------------------------------------
@app.route("/users", methods=["GET", "POST"]) # Done
def handle_users():
    handler = UsersHandler()
    if request.method == "POST":
        return handler.create_user(request.json)
    elif request.method == "GET":
        page = request.args.get("page", default=1, type=int)
        limit = request.args.get("limit", default=10, type=int)
        return handler.get_all_users(page, limit)



@app.route("/users/<int:user_id>", methods=["GET", "PUT", "DELETE"]) # Done (for PUT refer to upgrade_admin)
def handle_user(user_id):
    handler = UsersHandler()
    if request.method == "GET":
        return handler.get_user_by_id(user_id)
    elif request.method == "PUT":
        return handler.update_user(user_id, request.json)
    elif request.method == "DELETE":
        return handler.delete_user(user_id)


# -------------------------------------------------------
# USERS - MANAGEMENT ACTIONS
# -------------------------------------------------------
@app.route("/users/<int:user_id>/suspend", methods=["POST"]) # Ignore
def suspend_user(user_id):
    handler = UsersHandler()
    return handler.suspend_user(user_id)


@app.route("/users/<int:user_id>/unsuspend", methods=["POST"]) # Ignore
def unsuspend_user(user_id):
    handler = UsersHandler()
    return handler.unsuspend_user(user_id)


@app.route("/users/<int:user_id>/pin", methods=["POST"]) # Ignore
def pin_user(user_id):
    handler = UsersHandler()
    return handler.pin_user(user_id)


@app.route("/users/<int:user_id>/unpin", methods=["POST"]) # Ignore
def unpin_user(user_id):
    handler = UsersHandler()
    return handler.unpin_user(user_id)


@app.route("/users/<int:user_id>/upgrade-admin", methods=["POST"]) # Done
def upgrade_admin(user_id):
    handler = UsersHandler()
    return handler.upgrade_to_admin(user_id, request.json)



# -------------------------------------------------------
# AUTH
# -------------------------------------------------------
@app.route("/login", methods=["POST"]) # Done
def login():
    handler = UsersHandler()
    return handler.login(request.json)



@app.route("/logout", methods=["POST"]) # Done
def logout():
    handler = UsersHandler()
    return handler.logout()



# -------------------------------------------------------
# LOCATIONS
# -------------------------------------------------------
@app.route("/locations", methods=["GET", "POST"]) # Ignore
def handle_locations():
    handler = LocationsHandler()
    if request.method == "POST":
        return handler.create_location(request.json)
    elif request.method == "GET":
        page = request.args.get("page", default=1, type=int)
        limit = request.args.get("limit", default=10, type=int)
        return handler.get_all_locations(page, limit)



@app.route("/locations/<int:location_id>", methods=["GET", "PUT", "DELETE"]) # Ignore
def handle_location(location_id):
    handler = LocationsHandler()
    if request.method == "GET":
        return handler.get_location_by_id(location_id)
    elif request.method == "PUT":
        return handler.update_location(location_id, request.json)
    elif request.method == "DELETE":
        return handler.delete_location(location_id)


@app.route("/locations/<int:location_id>/details", methods=["GET"]) # Ignore
def get_location_details(location_id):
    handler = LocationsHandler()
    return handler.get_location_details(location_id)



@app.route("/locations/nearby", methods=["GET"]) # Ignore
def get_locations_nearby():
    handler = LocationsHandler()
    return handler.get_locations_nearby()



@app.route("/locations/with-reports", methods=["GET"]) # Done
def get_locations_with_reports():
    handler = LocationsHandler()
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=10, type=int)
    return handler.get_locations_with_reports(page, limit)



@app.route("/locations/stats", methods=["GET"]) # Ignore
def get_location_stats():
    handler = LocationsHandler()
    return handler.get_location_stats()



@app.route("/locations/search", methods=["GET"]) # Ignore
def search_locations():
    handler = LocationsHandler()
    return handler.search_locations()



# -------------------------------------------------------
# ADMINISTRATORS
# -------------------------------------------------------
@app.route("/administrators", methods=["GET", "POST"]) # Done (Ignore POST since admins are created when upgrading users)
def handle_administrators():
    handler = AdministratorsHandler()
    if request.method == "POST":
        return handler.create_administrator(request.json)
    elif request.method == "GET":
        page = request.args.get("page", default=1, type=int)
        limit = request.args.get("limit", default=10, type=int)
        return handler.get_all_administrators(page, limit)



@app.route("/administrators/<int:admin_id>", methods=["GET", "PUT", "DELETE"]) # Done (Ignore PUT and DELETE)
def handle_administrator(admin_id):
    handler = AdministratorsHandler()
    if request.method == "GET":
        return handler.get_administrator_by_id(admin_id)
    elif request.method == "PUT":
        return handler.update_administrator(admin_id, request.json)
    elif request.method == "DELETE":
        return handler.delete_administrator(admin_id)



@app.route("/administrators/department/<string:department>", methods=["GET"]) # Done
def get_administrators_by_department(department):
    handler = AdministratorsHandler()
    return handler.get_administrators_by_department(department)



@app.route("/administrators/<int:admin_id>/details", methods=["GET"]) # Ignore
def get_administrator_with_details(admin_id):
    handler = AdministratorsHandler()
    return handler.get_administrator_with_details(admin_id)



@app.route("/administrators/available", methods=["GET"]) # Ignore
def get_available_administrators():
    handler = AdministratorsHandler()
    return handler.get_available_administrators()



@app.route("/administrators/stats/all", methods=["GET"]) # Ignore
def get_all_admin_stats():
    handler = AdministratorsHandler()
    return handler.get_all_admin_stats()



@app.route("/administrators/check/<int:user_id>", methods=["GET"]) # Ignore
def check_user_is_administrator(user_id):
    handler = AdministratorsHandler()
    return handler.check_user_is_administrator(user_id)



@app.route("/administrators/performance", methods=["GET"]) # Ignore
def get_administrator_performance_report():
    handler = AdministratorsHandler()
    return handler.get_administrator_performance_report()


# NEW: /me/admin
@app.route("/me/admin", methods=["GET"]) # Ignore
def get_current_user_admin_info():
    user_id = request.args.get("user_id", type=int)

    if user_id is None:
        return {
            "error_msg": "user_id query parameter is required",
            "admin": False,
            "department": None,
        }, HTTP_STATUS.BAD_REQUEST

    dao = AdministratorsDAO()
    admin_row = dao.get_administrator_by_id(user_id)

    if not admin_row:
        return {
            "user_id": user_id,
            "admin": False,
            "department": None,
        }, HTTP_STATUS.OK

    department = admin_row[1]
    return {
        "user_id": user_id,
        "admin": True,
        "department": department,
    }, HTTP_STATUS.OK



# -------------------------------------------------------
# PINNED REPORTS
# -------------------------------------------------------
@app.route("/pinned-reports", methods=["GET", "POST"]) # Ignore
def handle_pinned_reports():
    handler = PinnedReportsHandler()
    if request.method == "POST":
        return handler.pin_report(request.json)
    elif request.method == "GET":
        user_id = request.args.get("user_id", type=int)
        page = request.args.get("page", default=1, type=int)
        limit = request.args.get("limit", default=10, type=int)
        return handler.get_pinned_reports(user_id, page, limit)



@app.route("/pinned-reports/<int:report_id>", methods=["DELETE"]) # Ignore
def handle_pinned_report(report_id):
    handler = PinnedReportsHandler()
    user_id = request.args.get("user_id", type=int)
    if request.method == "DELETE":
        return handler.unpin_report(user_id, report_id)



@app.route("/users/<int:user_id>/pinned-reports", methods=["GET"]) # Done
def handle_user_pinned_reports(user_id):
    handler = PinnedReportsHandler()
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=10, type=int)
    return handler.get_user_pinned_reports(user_id, page, limit)



@app.route("/pinned-reports/check/<int:user_id>/<int:report_id>", methods=["GET"]) # Ignore
def check_pinned_status(user_id, report_id):
    handler = PinnedReportsHandler()
    return handler.check_pinned_status(user_id, report_id)


@app.route("/reports/<int:report_id>/pinned-status", methods=["GET"]) # Ignore
def get_report_pinned_status(report_id):
    handler = PinnedReportsHandler()
    user_id = request.args.get("user_id", type=int)
    return handler.check_pinned_status(user_id, report_id)



@app.route("/pinned-reports/<int:user_id>/<int:report_id>/details", methods=["GET"]) # Ignore
def get_pinned_report_detail(user_id, report_id):
    handler = PinnedReportsHandler()
    return handler.get_pinned_report_detail(user_id, report_id)



# -------------------------------------------------------
# SEARCH & FILTER
# -------------------------------------------------------
@app.route("/reports/search", methods=["GET"]) # Ignore
def search_reports():
    handler = ReportsHandler()
    query = request.args.get("q", "")
    status = request.args.get("status")
    category = request.args.get("category")
    sort = request.args.get("sort")
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=10, type=int)
    admin_id = request.args.get("admin_id", type=int)
    location_id = request.args.get("location_id", type=int)
    city = request.args.get("city")
    return handler.search_reports(query, page, limit, status, category, sort, admin_id, location_id, city)


@app.route("/reports/filter", methods=["GET"]) # Ignore
def filter_reports():
    handler = ReportsHandler()
    status = request.args.get("status")
    category = request.args.get("category")
    sort = request.args.get("sort")
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=10, type=int)
    admin_id = request.args.get("admin_id", type=int)
    location_id = request.args.get("location_id", type=int)
    city = request.args.get("city")
    return handler.filter_reports(status, category, page, limit, sort, admin_id, location_id, city)



@app.route("/reports/user/<int:user_id>", methods=["GET"]) # Ignore
def get_user_reports(user_id):
    handler = ReportsHandler()
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=10, type=int)
    return handler.get_reports_by_user(user_id, page, limit)



# -------------------------------------------------------
# STATS & ADMIN
# -------------------------------------------------------
@app.route("/stats/overview", methods=["GET"]) # Ignore
def get_overview_stats():
    handler = ReportsHandler()
    return handler.get_overview_stats()



@app.route("/stats/department/<string:department>", methods=["GET"]) # Ignore
def get_department_overview_stats(department):
    handler = ReportsHandler()
    return handler.get_department_stats(department)



@app.route("/stats/user/<int:user_id>", methods=["GET"]) # Done
def get_user_stats(user_id):
    handler = UsersHandler()
    return handler.get_user_stats(user_id)



@app.route("/stats/admin/<int:admin_id>", methods=["GET"]) # Ignore
def get_admin_stats(admin_id):
    handler = AdministratorsHandler()
    return handler.get_admin_stats(admin_id)



@app.route("/admin/dashboard", methods=["GET"]) # Ignore
def get_admin_dashboard():
    handler = ReportsHandler()
    return handler.get_admin_dashboard()



@app.route("/admin/reports/pending", methods=["GET"]) # Ignore
def get_pending_reports():
    handler = ReportsHandler()
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=10, type=int)
    return handler.get_pending_reports(page, limit)



@app.route("/admin/reports/assigned", methods=["GET"]) # Ignore
def get_assigned_reports():
    handler = ReportsHandler()
    admin_id = request.args.get("admin_id", type=int)
    page = request.args.get("page", default=1, type=int)
    limit = request.args.get("limit", default=10, type=int)
    return handler.get_assigned_reports(admin_id, page, limit)

@app.route("/stats/resolution-rate-by-department", methods=["GET"])
def get_resolution_rate_by_department():
    handler = GlobalStatsHandler()
    return handler.get_resolution_rate_by_department()

@app.route("/stats/top-categories-percentage", methods=["GET"])
def get_top_categories_percentage():
    handler = GlobalStatsHandler()
    # default: top 3 categories
    n = request.args.get("n", default=3, type=int)
    if n <= 0:
        n = 1
    return handler.get_top_categories_percentage(n)

@app.route("/stats/avg-resolution-time-by-department", methods=["GET"])
def get_avg_resolution_time_by_department():
    handler = GlobalStatsHandler()
    return handler.get_avg_resolution_time_by_department()

@app.route("/stats/monthly-report-volume", methods=["GET"])
def get_monthly_report_volume():
    handler = GlobalStatsHandler()
    # default to last 12 months if not provided
    months = request.args.get("months", default=12, type=int)
    if months <= 0:
        months = 1
    return handler.get_monthly_report_volume(months)

# -------------------------------------------------------
# SYSTEM HEALTH
# -------------------------------------------------------
@app.route("/system/health", methods=["GET"]) # Ignore
def system_health():
    from datetime import datetime

    return {
        "status": "OK",
        "message": "System is running normally",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0",
    }


@app.route("/api/admin/<int:admin_id>/reports", methods=["GET"]) # Ignore
def get_reports_for_admin(admin_id):
    handler = AdministratorsHandler()
    return handler.get_reports_for_admin(admin_id)

# -------------------------------------------------------
# REPORTS - TOGGLE / UNRATE
# -------------------------------------------------------
@app.route("/reports/<int:report_id>/toggle-rate", methods=["POST"])
def toggle_rate_report(report_id):
    data = request.json
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    handler = ReportsHandler()
    return handler.toggle_rate_report(report_id, {"user_id": user_id})



@app.route("/reports/<int:report_id>/unrate", methods=["POST"])
def unrate_report(report_id):
    data = request.json
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id is required"}), 400

    handler = ReportsHandler()
    return handler.unrate_report(report_id, {"user_id": user_id})



# -------------------------------------------------------
# RUN
# -------------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)