from flask import request, jsonify
import jwt
from functools import wraps
import config

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check if token is in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            return jsonify({
                "status": "error",
                "message": "Authentication token is missing"
            }), 401
        
        try:
            # Decode token
            data = jwt.decode(token, config.SECRET_KEY, algorithms=["HS256"])
            current_user = {
                "id": data['id'],
                "email": data['email']
            }
        except jwt.ExpiredSignatureError:
            return jsonify({
                "status": "error",
                "message": "Token has expired"
            }), 401
        except jwt.InvalidTokenError:
            return jsonify({
                "status": "error",
                "message": "Invalid token"
            }), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

def format_cv_data(data):
    """
    Format CV data for frontend display
    """
    # Ensure standard sections exist
    sections = {
        "personal_info": {},
        "education": [],
        "work_experience": [],
        "skills": [],
        "projects": [],
        "certifications": [],
        "languages": []
    }
    
    # Process each field from Google Sheets
    for key, value in data.items():
        # Map Google Sheets columns to CV sections
        if key in ["Name", "Email", "Phone", "Address", "LinkedIn", "Website", "Summary"]:
            sections["personal_info"][key.lower()] = value
        elif key == "Education" and value:
            try:
                sections["education"] = parse_json_or_default(value, [])
            except:
                pass
        elif key == "WorkExperience" and value:
            try:
                sections["work_experience"] = parse_json_or_default(value, [])
            except:
                pass
        elif key == "Skills" and value:
            try:
                sections["skills"] = parse_json_or_default(value, [])
            except:
                pass
        elif key == "Projects" and value:
            try:
                sections["projects"] = parse_json_or_default(value, [])
            except:
                pass
        elif key == "Certifications" and value:
            try:
                sections["certifications"] = parse_json_or_default(value, [])
            except:
                pass
        elif key == "Languages" and value:
            try:
                sections["languages"] = parse_json_or_default(value, [])
            except:
                pass
    
    return sections

def parse_json_or_default(json_string, default):
    """
    Attempt to parse a JSON string, return default if parsing fails
    """
    import json
    try:
        if isinstance(json_string, str):
            return json.loads(json_string)
        return json_string
    except:
        return default