from flask import Blueprint, request, jsonify
from google_sheets import sheets_manager
import json
from utils.helpers import token_required

cv_blueprint = Blueprint('cv', __name__)

@cv_blueprint.route('/', methods=['GET'])
@token_required
def get_cv_data(current_user):
    user_id = current_user.get('id')
    cv_data = sheets_manager.get_user_data(user_id)
    
    if not cv_data:
        return jsonify({
            "status": "error",
            "message": "CV data not found"
        }), 404
    
    return jsonify({
        "status": "success",
        "data": cv_data
    })

@cv_blueprint.route('/', methods=['POST', 'PUT'])
@token_required
def update_cv_data(current_user):
    user_id = current_user.get('id')
    data = request.get_json()
    
    if not data:
        return jsonify({
            "status": "error",
            "message": "No data provided"
        }), 400
    
    # Add user ID to data
    data['UserID'] = user_id
    
    success = sheets_manager.update_user_data(user_id, data)
    
    if not success:
        return jsonify({
            "status": "error",
            "message": "Failed to update CV data"
        }), 500
    
    return jsonify({
        "status": "success",
        "message": "CV data updated successfully"
    })

@cv_blueprint.route('/sections/<section_name>', methods=['PUT'])
@token_required
def update_cv_section(current_user, section_name):
    user_id = current_user.get('id')
    data = request.get_json()
    
    if not data:
        return jsonify({
            "status": "error",
            "message": "No data provided"
        }), 400
    
    # Get current CV data
    cv_data = sheets_manager.get_user_data(user_id)
    
    if not cv_data:
        return jsonify({
            "status": "error",
            "message": "CV data not found"
        }), 404
    
    # Update the specific section
    if section_name in cv_data:
        # If the field is a JSON string, parse it first
        if isinstance(cv_data[section_name], str) and (cv_data[section_name].startswith('{') or cv_data[section_name].startswith('[')):
            try:
                section_data = json.loads(cv_data[section_name])
                section_data.update(data)
                cv_data[section_name] = json.dumps(section_data)
            except:
                cv_data[section_name] = json.dumps(data)
        else:
            # Otherwise just update with the new data
            cv_data[section_name] = json.dumps(data) if isinstance(data, (dict, list)) else data
    else:
        # Create new section
        cv_data[section_name] = json.dumps(data) if isinstance(data, (dict, list)) else data
    
    # Update the full CV
    success = sheets_manager.update_user_data(user_id, cv_data)
    
    if not success:
        return jsonify({
            "status": "error",
            "message": f"Failed to update {section_name} section"
        }), 500
    
    return jsonify({
        "status": "success",
        "message": f"{section_name} section updated successfully"
    })