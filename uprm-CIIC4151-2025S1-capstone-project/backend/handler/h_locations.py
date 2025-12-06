from flask import request, jsonify
from dao.d_locations import LocationsDAO
from constants import HTTP_STATUS


class LocationsHandler:

    def map_to_dict(self, location):
        """Map database result to dictionary"""
        return {
            "id": location[0],
            "city": location[1] if location[1] is not None else None,
            "latitude": float(location[2]) if location[2] is not None else None,
            "longitude": float(location[3]) if location[3] is not None else None,
        }

    def map_to_dict_with_reports(self, location):
        """Map location with report count to dictionary"""
        base_dict = self.map_to_dict(location)
        if len(location) > 4:  # Includes report_count
            base_dict["report_count"] = location[4]
        return base_dict

    def map_to_dict_with_distance(self, location):
        """Map location with distance to dictionary"""
        base_dict = self.map_to_dict(location)
        if len(location) > 4:  # Includes distance
            base_dict["distance_km"] = (
                float(location[4]) if location[4] is not None else None
            )
        return base_dict

    def map_to_dict_with_details(self, location):
        """Map location with address details to dictionary"""
        base_dict = self.map_to_dict(location)
        if len(location) > 4:  # Includes address fields
            base_dict["address"] = location[4]
            base_dict["country"] = location[5]
        return base_dict

    def get_all_locations(self, page=1, limit=10):
        try:
            offset = (page - 1) * limit

            dao = LocationsDAO()
            locations = dao.get_locations_paginated(limit, offset)
            total_count = dao.get_total_location_count()
            total_pages = (total_count + limit - 1) // limit

            locations_dict_list = [self.map_to_dict(location) for location in locations]

            return (
                jsonify(
                    {
                        "locations": locations_dict_list,
                        "totalPages": total_pages,
                        "currentPage": page,
                        "totalCount": total_count,
                    }
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_location_by_id(self, location_id):
        try:
            dao = LocationsDAO()
            location = dao.get_location_by_id(location_id)

            if not location:
                return (
                    jsonify({"error_msg": "Location not found"}),
                    HTTP_STATUS.NOT_FOUND,
                )

            location_dict = self.map_to_dict(location)
            return jsonify(location_dict), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def create_location(self, data):
        try:
            if not data:
                return jsonify({"error_msg": "Missing data"}), HTTP_STATUS.BAD_REQUEST

            required_fields = ["latitude", "longitude"]
            for field in required_fields:
                if field not in data:
                    return (
                        jsonify({"error_msg": f"Missing field: {field}"}),
                        HTTP_STATUS.BAD_REQUEST,
                    )

            latitude = data["latitude"]
            longitude = data["longitude"]

            # Validate coordinates
            if not isinstance(latitude, (int, float)) or not isinstance(
                longitude, (int, float)
            ):
                return (
                    jsonify({"error_msg": "Latitude and longitude must be numbers"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
                return (
                    jsonify(
                        {
                            "error_msg": "Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180"
                        }
                    ),
                    HTTP_STATUS.BAD_REQUEST,
                )

            dao = LocationsDAO()
            inserted_location = dao.create_location(latitude, longitude)

            if not inserted_location:
                return (
                    jsonify({"error_msg": "Location not inserted"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )

            inserted_location_dict = self.map_to_dict(inserted_location)
            return jsonify(inserted_location_dict), HTTP_STATUS.CREATED
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def update_location(self, location_id, data):
        try:
            dao = LocationsDAO()

            if not data:
                return jsonify({"error_msg": "Missing data"}), HTTP_STATUS.BAD_REQUEST

            if not dao.get_location_by_id(location_id):
                return (
                    jsonify({"error_msg": "Location not found"}),
                    HTTP_STATUS.NOT_FOUND,
                )

            latitude = data.get("latitude")
            longitude = data.get("longitude")

            # Validate coordinates if provided
            if latitude is not None:
                if not isinstance(latitude, (int, float)):
                    return (
                        jsonify({"error_msg": "Latitude must be a number"}),
                        HTTP_STATUS.BAD_REQUEST,
                    )
                if not (-90 <= latitude <= 90):
                    return (
                        jsonify(
                            {
                                "error_msg": "Invalid latitude. Must be between -90 and 90"
                            }
                        ),
                        HTTP_STATUS.BAD_REQUEST,
                    )

            if longitude is not None:
                if not isinstance(longitude, (int, float)):
                    return (
                        jsonify({"error_msg": "Longitude must be a number"}),
                        HTTP_STATUS.BAD_REQUEST,
                    )
                if not (-180 <= longitude <= 180):
                    return (
                        jsonify(
                            {
                                "error_msg": "Invalid longitude. Must be between -180 and 180"
                            }
                        ),
                        HTTP_STATUS.BAD_REQUEST,
                    )

            updated_location = dao.update_location(location_id, latitude, longitude)

            if not updated_location:
                return (
                    jsonify({"error_msg": "Location not updated"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )

            updated_location_dict = self.map_to_dict(updated_location)
            return jsonify(updated_location_dict), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def delete_location(self, location_id):
        try:
            dao = LocationsDAO()

            if not dao.get_location_by_id(location_id):
                return (
                    jsonify({"error_msg": "Location not found"}),
                    HTTP_STATUS.NOT_FOUND,
                )

            success = dao.delete_location(location_id)

            if not success:
                return (
                    jsonify({"error_msg": "Location not deleted"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )

            return "", HTTP_STATUS.NO_CONTENT
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_locations_nearby(self):
        """Get locations near specified coordinates"""
        try:
            latitude = request.args.get("latitude", type=float)
            longitude = request.args.get("longitude", type=float)
            radius = request.args.get(
                "radius", default=1, type=float
            )  # Default 1km radius
            limit = request.args.get("limit", default=20, type=int)

            if latitude is None or longitude is None:
                return (
                    jsonify(
                        {"error_msg": "Latitude and longitude parameters are required"}
                    ),
                    HTTP_STATUS.BAD_REQUEST,
                )

            # Validate coordinates
            if not (-90 <= latitude <= 90) or not (-180 <= longitude <= 180):
                return (
                    jsonify({"error_msg": "Invalid coordinates"}),
                    HTTP_STATUS.BAD_REQUEST,
                )

            dao = LocationsDAO()
            locations = dao.search_locations_nearby(latitude, longitude, radius, limit)

            locations_dict_list = [
                self.map_to_dict_with_distance(location) for location in locations
            ]

            return (
                jsonify(
                    {
                        "locations": locations_dict_list,
                        "search_center": {"latitude": latitude, "longitude": longitude},
                        "radius_km": radius,
                        "count": len(locations_dict_list),
                    }
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_locations_with_reports(self, page=1, limit=10):
        """Get locations with report counts"""
        try:
            offset = (page - 1) * limit

            dao = LocationsDAO()
            locations = dao.get_locations_with_reports_count(limit, offset)
            total_count = dao.get_total_location_count()
            total_pages = (total_count + limit - 1) // limit

            locations_dict_list = [
                self.map_to_dict_with_reports(location) for location in locations
            ]

            return (
                jsonify(
                    {
                        "locations": locations_dict_list,
                        "totalPages": total_pages,
                        "currentPage": page,
                        "totalCount": total_count,
                    }
                ),
                HTTP_STATUS.OK,
            )
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def get_location_stats(self):
        """Get location usage statistics"""
        try:
            dao = LocationsDAO()
            stats = dao.get_location_usage_stats()

            if not stats:
                return (
                    jsonify({"error_msg": "Failed to get location statistics"}),
                    HTTP_STATUS.INTERNAL_SERVER_ERROR,
                )

            stats_dict = {
                "total_locations": stats[0],
                "total_reports_with_location": stats[1],
                "unique_users_using_locations": stats[2],
            }

            return jsonify(stats_dict), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    def search_locations(self):
        """Search for locations by coordinates or nearby areas"""
        try:
            latitude = request.args.get("latitude", type=float)
            longitude = request.args.get("longitude", type=float)

            if latitude is not None and longitude is not None:
                # Search nearby locations
                return self.get_locations_nearby()
            else:
                # Return all locations with pagination
                page = request.args.get("page", default=1, type=int)
                limit = request.args.get("limit", default=10, type=int)
                return self.get_all_locations(page, limit)

        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR

    # =============================================================================
    # NEW METHOD FOR LOCATION DETAILS
    # =============================================================================

    def get_location_details(self, location_id):
        """Get location details with address information"""
        try:
            dao = LocationsDAO()
            location_details = dao.get_location_details(location_id)

            if not location_details:
                return (
                    jsonify({"error_msg": "Location not found"}),
                    HTTP_STATUS.NOT_FOUND,
                )

            location_dict = self.map_to_dict_with_details(location_details)
            return jsonify(location_dict), HTTP_STATUS.OK
        except Exception as e:
            return jsonify({"error_msg": str(e)}), HTTP_STATUS.INTERNAL_SERVER_ERROR
