from flask import Flask, jsonify
from flask_cors import CORS
from routes.cv import cv_blueprint
from routes.auth import auth_blueprint
import config

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": config.FRONTEND_URL}})

# Register blueprints
app.register_blueprint(cv_blueprint, url_prefix='/api/cv')
app.register_blueprint(auth_blueprint, url_prefix='/api/auth')

# Basic routes
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "success",
        "message": "API is running"
    })

if __name__ == '__main__':
    app.run(debug=config.DEBUG, host=config.HOST, port=config.PORT)