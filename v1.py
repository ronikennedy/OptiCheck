import streamlit as st
import cv2
import numpy as np
import face_recognition
import time
import gspread
import os
from datetime import datetime
from oauth2client.service_account import ServiceAccountCredentials

# Set page configuration and theme
st.set_page_config(
    page_title="OptiCheck",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Custom CSS to match the design
st.markdown("""
<style>
    /* Base color scheme */
    :root {
        --primary-white: #ffffff;
        --primary-green: #e0e8d8;
        --secondary-blue: #d3e0ea;
        --text-dark: #2c3e50;
        --accent-color: #3498db;
    }

    /* General styling */
    body {
        color: var(--text-dark);
        background-color: linear-gradient(to right, var(--primary-white), var(--primary-green));
    }

    /* Streamlit base container */
    .main .block-container {
        max-width: 1000px;
        padding-top: 2rem;
        padding-bottom: 2rem;
        background: linear-gradient(to right, var(--primary-white), var(--secondary-blue));
        border-radius: 15px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    /* Titles and headers */
    h1, h2, h3 {
        color: var(--text-dark);
        font-weight: 600;
    }

    /* Buttons */
    .stButton > button {
        background-color: var(--accent-color);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 10px 20px;
        transition: all 0.3s ease;
    }

    .stButton > button:hover {
        background-color: #2980b9;
        transform: scale(1.05);
    }

    /* Metrics */
    .metric-container {
        background-color: rgba(255, 255, 255, 0.7);
        border-radius: 10px;
        padding: 15px;
        margin-bottom: 15px;
    }

    /* Progress bar */
    .stProgress > div > div {
        background-color: var(--accent-color);
    }

    /* Cards and containers */
    .stContainer {
        background-color: rgba(255, 255, 255, 0.8);
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 20px;
    }
</style>
""", unsafe_allow_html=True)

# Configuration and Constants
SHEET_ID = "1CfCez2g2pgcKmhBxdAth-s-h5Hs8PySVrLQJ6o1vR4w"
SERVICE_ACCOUNT_FILE = "/Users/ronikennedy/Library/Mobile Documents/com~apple~CloudDocs/OptiCheck/backend/opticheck_GS.json"
IMAGE_FOLDER = "/Users/ronikennedy/Library/Mobile Documents/com~apple~CloudDocs/OptiCheck/backend/app/match_images"

# Initialize session state
if 'stage' not in st.session_state:
    st.session_state.stage = 'identity_verification'
if 'user_data' not in st.session_state:
    st.session_state.user_data = None
if 'recognized_name' not in st.session_state:
    st.session_state.recognized_name = None
if 'vitals_data' not in st.session_state:
    st.session_state.vitals_data = None
if 'check_in_complete' not in st.session_state:
    st.session_state.check_in_complete = False

# ---- GOOGLE SHEETS SETUP ----
def setup_google_sheets():
    """Set up Google Sheets authentication"""
    scope = [
        "https://spreadsheets.google.com/feeds", 
        "https://www.googleapis.com/auth/spreadsheets", 
        "https://www.googleapis.com/auth/drive"
    ]
    creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
    client = gspread.authorize(creds)
    sheet = client.open_by_key(SHEET_ID).sheet1
    return sheet

# ---- FACE RECOGNITION FUNCTIONS ----
def load_reference_faces():
    """Load reference face encodings from image folder"""
    reference_encodings = []
    reference_names = []

    if not os.path.exists(IMAGE_FOLDER) or not os.listdir(IMAGE_FOLDER):
        st.error("Reference images folder is missing or empty.")
        return [], []

    image_files = [f for f in os.listdir(IMAGE_FOLDER) if f.endswith(('.jpg', '.png'))]
    if not image_files:
        st.error("No image files found in the folder.")
        return [], []

    for filename in image_files:
        image_path = os.path.join(IMAGE_FOLDER, filename)
        image = face_recognition.load_image_file(image_path)
        encodings = face_recognition.face_encodings(image)
        if encodings:
            reference_encodings.append(encodings[0])
            reference_names.append(filename.split('.')[0])
        else:
            st.warning(f"No face found in {filename}. Skipping this file.")

    return reference_encodings, reference_names

def perform_face_recognition(reference_encodings, reference_names):
    """Perform face recognition using webcam"""
    video_capture = cv2.VideoCapture(0)
    if not video_capture.isOpened():
        st.error("Unable to access the webcam. Please check permissions.")
        return None

    stframe = st.empty()
    start_time = time.time()
    recognized_name = "Unknown"
    
    # Create a loading indicator
    with st.spinner("Analyzing your identity..."):
        # Run face recognition for 5 seconds
        while time.time() - start_time < 5:
            ret, frame = video_capture.read()
            if not ret:
                st.warning("Failed to capture video.")
                break

            # Convert frame to RGB
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_locations = face_recognition.face_locations(rgb_frame)
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

            recognized_name = "Unknown"
            for face_encoding in face_encodings:
                matches = face_recognition.compare_faces(reference_encodings, face_encoding)
                if True in matches:
                    matched_idx = matches.index(True)
                    recognized_name = reference_names[matched_idx]
                    break

            # Draw bounding box
            for (top, right, bottom, left), name in zip(face_locations, [recognized_name]):
                color = (46, 204, 113) if name != "Unknown" else (231, 76, 60)  # Green or red
                cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
                
                # Add a background for the text
                cv2.rectangle(frame, (left, top - 30), (right, top), color, cv2.FILLED)
                
                # Add name text
                font = cv2.FONT_HERSHEY_DUPLEX
                cv2.putText(frame, name, (left + 6, top - 6), font, 0.8, (255, 255, 255), 1)

            # Display in Streamlit
            stframe.image(frame, channels="BGR")

    video_capture.release()
    cv2.destroyAllWindows()
    return recognized_name

# ---- STAGE FUNCTIONS ----
def identity_verification_stage():
    """Handle identity verification process"""
    st.title("OptiCheck")
    st.markdown("Welcome to your personal health monitoring system")

    # Load reference faces
    reference_encodings, reference_names = load_reference_faces()

    # Create a centered container for face recognition
    col1, col2, col3 = st.columns([1, 2, 1])
    
    with col2:
        st.subheader("Identity Verification")
        st.markdown("Place yourself in front of the camera")
        
        if st.button("Start Face Recognition", use_container_width=True):
            recognized_name = perform_face_recognition(reference_encodings, reference_names)
            
            if recognized_name and recognized_name != "Unknown":
                # Retrieve user data from Google Sheets
                try:
                    sheet = setup_google_sheets()
                    users_data = sheet.get_all_records()
                    
                    matched_user = next((user for user in users_data 
                                         if user.get('Verified Users') == recognized_name), None)
                    
                    if matched_user:
                        st.session_state.recognized_name = recognized_name
                        st.session_state.user_data = matched_user
                        st.session_state.stage = 'personal_info'
                        st.rerun()
                    else:
                        st.error("User not found in the system.")
                
                except Exception as e:
                    st.error(f"Database connection error: {e}")
            else:
                st.warning("No identity match found. Please try again.")

def personal_info_stage():
    """Display and manage personal information"""
    st.title(f"Welcome, {st.session_state.recognized_name}")
    
    # Create two columns for layout
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Your Health Profile")
        
        # Create a container for metrics
        with st.container(border=True):
            col_a, col_b, col_c = st.columns(3)
            
            with col_a:
                st.metric("Age", st.session_state.user_data.get('Age', 'N/A'))
            
            with col_b:
                st.metric("Weight", 
                          f"{st.session_state.user_data.get('Weight', 'N/A')} lbs")
            
            with col_c:
                st.metric("Height", 
                          f"{st.session_state.user_data.get('Height', 'N/A')} cm")
    
    with col2:
        st.subheader("Additional Details")
        
        # Display additional information in a container
        with st.container(border=True):
            for key, value in st.session_state.user_data.items():
                if key not in ['Verified Users', 'Age', 'Weight', 'Height']:
                    st.write(f"**{key}:** {value}")
    
    # Navigation buttons
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("Edit Information", use_container_width=True):
            st.session_state.stage = 'edit_info'
            st.rerun()
    
    with col2:
        if st.button("Begin Health Scan", use_container_width=True):
            st.session_state.stage = 'health_scan'
            st.rerun()

def edit_info_stage():
    """Allow user to edit personal information"""
    st.title("Edit Health Profile")
    
    # Validate and sanitize input values
    def sanitize_input(key, value):
        """
        Sanitize input values based on their key
        Handles different types of inputs and prevents invalid entries
        """
        if isinstance(value, (int, float)):
            # Handle numeric inputs
            if 'Weight' in key:
                # Weight range: 0-1000 lbs
                return min(max(0, float(value)), 1000)
            elif 'Height' in key:
                # Height range: 0-300 cm
                return min(max(0, float(value)), 300)
            elif 'Age' in key:
                # Age range: 0-120 years
                return min(max(0, int(value)), 120)
            elif 'Phone' in key or 'Contact' in key:
                # For phone numbers, convert to string
                return str(int(value))
            else:
                # Default numeric handling
                return min(max(0, float(value)), 1000)
        elif isinstance(value, str):
            # Trim and limit string length
            return value.strip()[:500]
        return value
    
    # Create form for editing information
    with st.form(key="edit_profile_form", clear_on_submit=False):
        st.subheader("Update Your Information")
        
        # Create two columns for form layout
        col1, col2 = st.columns(2)
        
        # Dynamically create input fields based on existing user data
        edited_data = {}
        
        def create_input_field(key, value, column):
            """Create appropriate input field based on value type"""
            with column:
                # Convert value to appropriate type
                if isinstance(value, str):
                    # Text inputs for string values
                    edited_data[key] = st.text_input(
                        f"{key}", 
                        value=str(value), 
                        max_chars=500
                    )
                elif isinstance(value, (int, float)):
                    # Numeric inputs with specific ranges
                    if 'Weight' in key:
                        edited_data[key] = st.number_input(
                            f"{key} (lbs)", 
                            value=min(float(value), 1000.0), 
                            min_value=0.0, 
                            max_value=1000.0,
                            step=1.0
                        )
                    elif 'Height' in key:
                        edited_data[key] = st.number_input(
                            f"{key} (cm)", 
                            value=min(float(value), 300.0), 
                            min_value=0.0, 
                            max_value=300.0,
                            step=1.0
                        )
                    elif 'Age' in key:
                        edited_data[key] = st.number_input(
                            f"{key}", 
                            value=min(int(value), 120), 
                            min_value=0, 
                            max_value=120,
                            step=1
                        )
                    elif 'Phone' in key or 'Contact' in key:
                        # Special handling for phone numbers
                        edited_data[key] = st.text_input(
                            f"{key}", 
                            value=str(int(value) if isinstance(value, (int, float)) else value), 
                            max_chars=20
                        )
                    else:
                        # Fallback for other numeric fields
                        edited_data[key] = st.number_input(
                            f"{key}", 
                            value=min(float(value), 1000.0), 
                            min_value=0.0, 
                            max_value=1000.0,
                            step=1.0
                        )
                else:
                    # Fallback for any other type
                    edited_data[key] = st.text_input(
                        f"{key}", 
                        value=str(value), 
                        max_chars=500
                    )
        
        # Populate first column
        with col1:
            st.write("First Half of Information")
            for key, value in list(st.session_state.user_data.items())[:len(st.session_state.user_data)//2]:
                if key == 'Verified Users':
                    continue  # Skip editing username
                create_input_field(key, value, col1)
        
        # Populate second column
        with col2:
            st.write("Second Half of Information")
            for key, value in list(st.session_state.user_data.items())[len(st.session_state.user_data)//2:]:
                if key == 'Verified Users':
                    continue  # Skip editing username
                create_input_field(key, value, col2)
        
        # Submit button
        submit = st.form_submit_button("Save Changes", use_container_width=True)
        
        if submit:
            try:
                # Sanitize all inputs
                sanitized_data = {
                    key: sanitize_input(key, value) 
                    for key, value in edited_data.items()
                }
                
                # Update Google Sheets
                sheet = setup_google_sheets()
                users_data = sheet.get_all_records()
                
                # Find the row for the current user
                user_row = next(
                    (idx for idx, user in enumerate(users_data, start=2) 
                     if user.get('Verified Users') == st.session_state.recognized_name),
                    None
                )
                
                if user_row:
                    # Update each column
                    headers = sheet.row_values(1)
                    for key, value in sanitized_data.items():
                        if key in headers:
                            col_index = headers.index(key) + 1
                            sheet.update_cell(user_row, col_index, value)
                
                # Update local session state
                st.session_state.user_data.update(sanitized_data)
                
                st.success("Profile updated successfully!")
                time.sleep(1)
                st.session_state.stage = 'personal_info'
                st.rerun()
            
            except Exception as e:
                st.error(f"Error updating profile: {e}")
    
    # Cancel button OUTSIDE the form
    if st.button("Cancel", use_container_width=True):
        st.session_state.stage = 'personal_info'
        st.rerun()
        
def edit_info_stage():
    """Allow user to edit personal information"""
    st.title("Edit Health Profile")
    
    # Validate and sanitize input values
    def sanitize_input(key, value):
        """
        Sanitize input values based on their key
        Handles different types of inputs and prevents invalid entries
        """
        if isinstance(value, (int, float)):
            # Handle numeric inputs
            if 'Weight' in key:
                # Weight range: 0-1000 lbs
                return min(max(0, int(value)), 1000)
            elif 'Height' in key:
                # Height range: 0-300 cm
                return min(max(0, int(value)), 300)
            elif 'Age' in key:
                # Age range: 0-120 years
                return min(max(0, int(value)), 120)
            else:
                # Default numeric handling
                return min(max(0, int(value)), 10000)
        elif isinstance(value, str):
            # Trim and limit string length
            return value.strip()[:500]
        return value
    
    # Create form for editing information
    with st.form(key="edit_profile_form", clear_on_submit=False):
        st.subheader("Update Your Information")
        
        # Create two columns for form layout
        col1, col2 = st.columns(2)
        
        # Dynamically create input fields based on existing user data
        edited_data = {}
        
        def create_input_field(key, value, column):
            """Create appropriate input field based on value type"""
            with column:
                if isinstance(value, (int, float)):
                    # Numeric inputs with specific ranges
                    if 'Weight' in key:
                        edited_data[key] = st.number_input(
                            f"{key} (lbs)", 
                            value=float(value), 
                            min_value=0.0, 
                            max_value=1000.0,
                            step=1.0
                        )
                    elif 'Height' in key:
                        edited_data[key] = st.number_input(
                            f"{key} (cm)", 
                            value=float(value), 
                            min_value=0.0, 
                            max_value=300.0,
                            step=1.0
                        )
                    elif 'Age' in key:
                        edited_data[key] = st.number_input(
                            f"{key}", 
                            value=int(value), 
                            min_value=0, 
                            max_value=120,
                            step=1
                        )
                    else:
                        # Fallback for other numeric fields
                        edited_data[key] = st.number_input(
                            f"{key}", 
                            value=float(value), 
                            min_value=0.0, 
                            max_value=10000.0,
                            step=1.0
                        )
                else:
                    # Text inputs
                    edited_data[key] = st.text_input(
                        f"{key}", 
                        value=str(value), 
                        max_chars=500
                    )
        
        # Populate first column
        with col1:
            st.write("First Half of Information")
            for key, value in list(st.session_state.user_data.items())[:len(st.session_state.user_data)//2]:
                if key == 'Verified Users':
                    continue  # Skip editing username
                create_input_field(key, value, col1)
        
        # Populate second column
        with col2:
            st.write("Second Half of Information")
            for key, value in list(st.session_state.user_data.items())[len(st.session_state.user_data)//2:]:
                if key == 'Verified Users':
                    continue  # Skip editing username
                create_input_field(key, value, col2)
        
        # Submit button
        submit = st.form_submit_button("Save Changes", use_container_width=True)
        
        if submit:
            try:
                # Sanitize all inputs
                sanitized_data = {
                    key: sanitize_input(key, value) 
                    for key, value in edited_data.items()
                }
                
                # Update Google Sheets
                sheet = setup_google_sheets()
                users_data = sheet.get_all_records()
                
                # Find the row for the current user
                user_row = next(
                    (idx for idx, user in enumerate(users_data, start=2) 
                     if user.get('Verified Users') == st.session_state.recognized_name),
                    None
                )
                
                if user_row:
                    # Update each column
                    headers = sheet.row_values(1)
                    for key, value in sanitized_data.items():
                        if key in headers:
                            col_index = headers.index(key) + 1
                            sheet.update_cell(user_row, col_index, value)
                
                # Update local session state
                st.session_state.user_data.update(sanitized_data)
                
                st.success("Profile updated successfully!")
                time.sleep(1)
                st.session_state.stage = 'personal_info'
                st.rerun()
            
            except Exception as e:
                st.error(f"Error updating profile: {e}")
    
    # Cancel button OUTSIDE the form
    if st.button("Cancel", use_container_width=True):
        st.session_state.stage = 'personal_info'
        st.rerun()

def health_scan_stage():
    """Conduct health scan and record vitals"""
    st.title("Health Scan")
    
    st.markdown(f"Hello {st.session_state.recognized_name}, let's conduct your health scan.")
    
    # Scan instructions in a container
    with st.container(border=True):
        st.subheader("Scan Instructions")
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("""
            1. Sit comfortably and remain still
            2. Look directly at the camera
            3. Breathe normally
            """)
        
        with col2:
            st.markdown("""
            4. Scan will take approximately 30 seconds
            5. Ensure good lighting
            6. Stay relaxed
            """)
    
    # Start scan button
    if st.button("Begin Health Scan", use_container_width=True):
        # Simulate scan process
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        for i in range(101):
            progress_bar.progress(i)
            
            # Update status text
            if i < 30:
                status_text.text("Initializing scan...")
            elif i < 60:
                status_text.text("Collecting vital signs...")
            elif i < 90:
                status_text.text("Processing health data...")
            else:
                status_text.text("Finalizing report...")
            
            time.sleep(0.05)
        
        # Generate mock vitals data
        vitals_data = {
            'heart_rate': 72,
            'blood_pressure': '120/80',
            'respiratory_rate': 16,
            'stress_level': 'Low',
            'bmi': 24.5,
            'oxygen_saturation': 98,
            'timestamp': datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        st.session_state.vitals_data = vitals_data
        st.session_state.stage = 'vitals_report'
        st.rerun()

def vitals_report_stage():
    """Display vitals report and provide recommendations"""
    st.title("Health Check Report")
    
    if not st.session_state.vitals_data:
        st.error("No vitals data available.")
        return
    
    vitals = st.session_state.vitals_data
    
    # Create a container for vitals
    with st.container(border=True):
        st.subheader("Vital Signs")
        
        # Create columns for metrics
        col1, col2 = st.columns(2)
        
        with col1:
            st.metric("Heart Rate", f"{vitals['heart_rate']} bpm")
            st.metric("Blood Pressure", vitals['blood_pressure'])
            st.metric("BMI", f"{vitals['bmi']:.1f}")
        
        with col2:
            st.metric("Respiratory Rate", f"{vitals['respiratory_rate']} bpm")
            st.metric("Stress Level", vitals['stress_level'])
            st.metric("Oxygen Saturation", f"{vitals['oxygen_saturation']}%")
    
    # Health insights and recommendations
    with st.container(border=True):
        st.subheader("Health Insights")
        
        # Generate personalized insights based on vitals
        insights = []
        
        if vitals['heart_rate'] > 100 or vitals['heart_rate'] < 60:
            insights.append("Your heart rate is outside the normal range. Consider consulting a healthcare professional.")
        
        if vitals['blood_pressure'] != '120/80':
            insights.append("Your blood pressure might need attention. Consult with your doctor.")
        
        if vitals['bmi'] > 25:
            insights.append("Your BMI suggests you might be overweight. Consider discussing a healthy lifestyle plan.")
        elif vitals['bmi'] < 18.5:
            insights.append("Your BMI suggests you might be underweight. Consult a nutritionist.")
        
        if vitals['stress_level'] == 'High':
            insights.append("Your stress levels seem elevated. Consider stress management techniques.")
        
        if vitals['oxygen_saturation'] < 95:
            insights.append("Your oxygen saturation is lower than optimal. This may require medical attention.")
        
        # Display insights
        if insights:
            for insight in insights:
                st.warning(insight)
        else:
            st.success("Your vitals look great! Keep up the good work.")
    
    # Check-in completion
    st.subheader("Check-in Completion")
    
    if not st.session_state.check_in_complete:
        if st.button("Complete Check-in", use_container_width=True):
            # Update check-in status
            st.session_state.check_in_complete = True
            
            try:
                # Update Google Sheets with check-in information
                sheet = setup_google_sheets()
                
                # Find the user's row
                users_data = sheet.get_all_records()
                user_row = next(
                    (idx for idx, user in enumerate(users_data, start=2) 
                     if user.get('Verified Users') == st.session_state.recognized_name),
                    None
                )
                
                if user_row:
                    # Update last check-in date and vitals
                    headers = sheet.row_values(1)
                    
                    # Update last check-in date
                    last_check_in_col = headers.index('Last Check-in') + 1 if 'Last Check-in' in headers else None
                    if last_check_in_col:
                        sheet.update_cell(user_row, last_check_in_col, datetime.now().strftime("%Y-%m-%d"))
                    
                    # Optional: Update vitals columns if they exist
                    vitals_mapping = {
                        'Heart Rate': vitals['heart_rate'],
                        'Blood Pressure': vitals['blood_pressure'],
                        'Respiratory Rate': vitals['respiratory_rate'],
                        'Stress Level': vitals['stress_level'],
                        'BMI': vitals['bmi'],
                        'Oxygen Saturation': vitals['oxygen_saturation']
                    }
                    
                    for key, value in vitals_mapping.items():
                        if key in headers:
                            col_index = headers.index(key) + 1
                            sheet.update_cell(user_row, col_index, value)
                
                st.success("Check-in completed successfully!")
            except Exception as e:
                st.error(f"Error updating check-in: {e}")
    else:
        st.success("Check-in Complete ✓")
    
    # Action buttons
    col1, col2 = st.columns(2)
    
    with col1:
        if st.button("Start Over", use_container_width=True):
            # Reset session state
            st.session_state.stage = 'identity_verification'
            st.session_state.recognized_name = None
            st.session_state.user_data = None
            st.session_state.vitals_data = None
            st.session_state.check_in_complete = False
            st.rerun()
    
    with col2:
        if st.button("End Session", use_container_width=True):
            # Reset session state
            st.session_state.stage = 'identity_verification'
            st.session_state.recognized_name = None
            st.session_state.user_data = None
            st.session_state.vitals_data = None
            st.session_state.check_in_complete = False
            st.rerun()

# ---- MAIN APP ROUTING ----
def main():
    # Route to the appropriate stage based on session state
    if st.session_state.stage == 'identity_verification':
        identity_verification_stage()
    elif st.session_state.stage == 'personal_info':
        personal_info_stage()
    elif st.session_state.stage == 'edit_info':
        edit_info_stage()
    elif st.session_state.stage == 'health_scan':
        health_scan_stage()
    elif st.session_state.stage == 'vitals_report':
        vitals_report_stage()

# Run the main app
if __name__ == "__main__":
    main()
