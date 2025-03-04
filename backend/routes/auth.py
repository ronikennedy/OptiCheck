from flask import Blueprint, request, jsonify
import jwt
import datetime
import config
from google_sheets import sheets_manager
from utils.helpers import token_required

auth_blueprint = Blueprint('auth', __name__)

@auth_blueprint.route('/login', methods=['POST'])
def login():
    auth = request.get_json()
    
    if not auth or not auth.get('email') or not auth.get('password'):
        return jsonify({
            "status": "error",
            "message": "Email and password required"
        }), 400
    
    email = auth.get('email')
    password = auth.get('password')
    
    # Get all users from Google Sheets
    users = sheets_manager.get_all_data()
    
    if not users:
        return jsonify({
            "status": "error",
            "message": "Authentication failed"
        }), 401
    
    # Find the user with the matching email
    user = next((u for u in users if u.get('Email') == email), None)
    
    if not user or user.get('Password') != password:  # In production, use proper password hashing
        return jsonify({
            "status": "error",
            "message": "Invalid credentials"
        }), 401
    
    # Generate token
    token = jwt.encode({
        'id': user.get('UserID'),
        'email': user.get('Email'),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, config.SECRET_KEY)
    
    return jsonify({
        "status": "success",
        "token": token,
        "user": {
            "id": user.get('UserID'),
            "name": user.get('Name'),
            "email": user.get('Email')
        }
    })

@auth_blueprint.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('name'):
        return jsonify({
            "status": "error",
            "message": "Name, email and password required"
        }), 400
    
    email = data.get('email')
    
    # Get all users to check if email already exists
    users = sheets_manager.get_all_data()
    
    if users and any(u.get('Email') == email for u in users):
        return jsonify({
            "status": "error",
            "message": "Email already registered"
        }), 409
    
    # Generate unique user ID
    import uuid
    user_id = str(uuid.uuid4())
    
    # Prepare user data
    user_data = {
        'UserID': user_id,
        'Name': data.get('name'),
        'Email': data.get('email'),
        'Password': data.get('password'),  # In production, hash this password
        'CreatedAt': datetime.datetime.now().isoformat(),
        'LastModified': datetime.datetime.now().isoformat()
    }
    
    # Add user to Google Sheets
    success = sheets_manager.add_user_data(user_data)
    
    if not success:
        return jsonify({
            "status": "error",
            "message": "Failed to register user"
        }), 500
    
    # Generate token
    token = jwt.encode({
        'id': user_id,
        'email': data.get('email'),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, config.SECRET_KEY)
    
    return jsonify({
        "status": "success",
        "message": "User registered successfully",
        "token": token,
        "user": {
            "id": user_id,
            "name": data.get('name'),
            "email": data.get('email')
        }
    }), 201

@auth_blueprint.route('/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    user_id = current_user.get('id')
    user_data = sheets_manager.get_user_data(user_id)
    
    if not user_data:
        return jsonify({
            "status": "error",
            "message": "User not found"
        }), 404
    
    # Remove sensitive data
    if 'Password' in user_data:
        del user_data['Password']
    
    return jsonify({
        "status": "success",
        "data": user_data
    })