from dotenv import load_dotenv
from load import load_db


class LocationsDAO:

    def __init__(self):
        load_dotenv()
        self.conn = load_db()

    def get_locations_paginated(self, limit, offset):
        query = "SELECT * FROM location ORDER BY id LIMIT %s OFFSET %s"
        with self.conn.cursor() as cur:
            cur.execute(query, (limit, offset))
            return cur.fetchall()

    def get_total_location_count(self):
        query = "SELECT COUNT(*) FROM location"
        with self.conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchone()[0]

    def get_all_locations(self):
        query = "SELECT * FROM location ORDER BY id"
        with self.conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchall()

    def get_location_by_id(self, location_id):
        query = "SELECT * FROM location WHERE id = %s"
        with self.conn.cursor() as cur:
            cur.execute(query, (location_id,))
            return cur.fetchone()

    def create_location(self, city, latitude, longitude):
        query = """
            INSERT INTO location (city, latitude, longitude)
            VALUES (%s,%s, %s)
            RETURNING *
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (city, latitude, longitude))
            self.conn.commit()
            return cur.fetchone()

    def update_location(self, location_id, city=None, latitude=None, longitude=None):
        # Build dynamic query based on provided fields
        fields = []
        params = []

        if city is not None:
            fields.append("city = %s")
            params.append(city)
        if latitude is not None:
            fields.append("latitude = %s")
            params.append(latitude)
        if longitude is not None:
            fields.append("longitude = %s")
            params.append(longitude)

        if not fields:
            return None

        query = f"""
            UPDATE location
            SET {', '.join(fields)}
            WHERE id = %s
            RETURNING *
        """
        params.append(location_id)

        with self.conn.cursor() as cur:
            cur.execute(query, params)
            self.conn.commit()
            return cur.fetchone()

    def delete_location(self, location_id):
        query = "DELETE FROM location WHERE id = %s RETURNING *"
        with self.conn.cursor() as cur:
            cur.execute(query, (location_id,))
            self.conn.commit()
            result = cur.fetchone()
            return result is not None

    def get_locations_by_coordinates(self, latitude, longitude, radius_km=1):
        """
        Find locations within a certain radius of given coordinates
        Uses Haversine formula for distance calculation
        """
        query = """
            SELECT *,
                (6371 * acos(cos(radians(%s)) * cos(radians(latitude)) *
                cos(radians(longitude) - radians(%s)) + sin(radians(%s)) *
                sin(radians(latitude)))) AS distance
            FROM location
            WHERE (6371 * acos(cos(radians(%s)) * cos(radians(latitude)) *
                   cos(radians(longitude) - radians(%s)) + sin(radians(%s)) *
                   sin(radians(latitude)))) < %s
            ORDER BY distance
        """
        with self.conn.cursor() as cur:
            cur.execute(
                query,
                (
                    latitude,
                    longitude,
                    latitude,
                    latitude,
                    longitude,
                    latitude,
                    radius_km,
                ),
            )
            return cur.fetchall()

    def get_locations_with_reports_count(self, limit, offset):
        """Get locations with count of associated reports"""
        query = """
            SELECT 
                l.id,
                l.city,
                l.latitude,
                l.longitude,
                COUNT(r.id) AS report_count
            FROM location l
            LEFT JOIN reports r ON l.id = r.location
            GROUP BY l.id, l.city, l.latitude, l.longitude
            ORDER BY report_count DESC
            LIMIT %s OFFSET %s
        """
        with self.conn.cursor() as cur:
            cur.execute(query, (limit, offset))
            return cur.fetchall()

    def get_location_usage_stats(self):
        """Get statistics about location usage in reports"""
        query = """
            SELECT
                COUNT(DISTINCT l.id) as total_locations,
                COUNT(r.id) as total_reports_with_location,
                COUNT(DISTINCT r.created_by) as unique_users_using_locations
            FROM location l
            LEFT JOIN reports r ON l.id = r.location
        """
        with self.conn.cursor() as cur:
            cur.execute(query)
            return cur.fetchone()

    def search_locations_nearby(
        self, latitude, longitude, max_distance_km=10, limit=20
    ):
        """Search for locations near given coordinates"""
        query = """
            SELECT *,
                (6371 * acos(cos(radians(%s)) * cos(radians(latitude)) *
                cos(radians(longitude) - radians(%s)) + sin(radians(%s)) *
                sin(radians(latitude)))) AS distance
            FROM location
            WHERE (6371 * acos(cos(radians(%s)) * cos(radians(latitude)) *
                   cos(radians(longitude) - radians(%s)) + sin(radians(%s)) *
                   sin(radians(latitude)))) < %s
            ORDER BY distance
            LIMIT %s
        """
        with self.conn.cursor() as cur:
            cur.execute(
                query,
                (
                    latitude,
                    longitude,
                    latitude,
                    latitude,
                    longitude,
                    latitude,
                    max_distance_km,
                    limit,
                ),
            )
            return cur.fetchall()

    # =============================================================================
    # NEW METHOD FOR LOCATION DETAILS
    # =============================================================================

    def get_location_details(self, location_id):
        """Get location details with address information"""
        # First get the basic location data
        query = "SELECT * FROM location WHERE id = %s"
        with self.conn.cursor() as cur:
            cur.execute(query, (location_id,))
            location = cur.fetchone()

            if not location:
                return None

            # For now, return mock address data
            # In a real implementation, you would:
            # 1. Have address columns in the location table, OR
            # 2. Use a geocoding service (Google Maps, OpenStreetMap, etc.)
            # 3. Cache the results in your database

            return (
                location[0],  # id
                location[1],  # latitude
                location[2],  # longitude
                self._reverse_geocode(location[1], location[2]),  # address
                "San Juan",  # city
                "Puerto Rico",  # country
            )

    def _reverse_geocode(self, latitude, longitude):
        """
        Mock reverse geocoding function.
        In a real implementation, you would call a geocoding API here.
        """
        # This is a simple mock - in reality you'd use:
        # - Google Maps Geocoding API
        # - OpenStreetMap Nominatim
        # - Another geocoding service

        # For now, return a formatted address based on coordinates
        return f"Near {latitude:.6f}, {longitude:.6f}"

    def close(self):
        if self.conn:
            self.conn.close()
