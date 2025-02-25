import streamlit as st
import cv2
import numpy as np
import face_recognition
import time
import gspread
import os
from oauth2client.service_account import ServiceAccountCredentials

# Set page configuration and theme
st.set_page_config(
    page_title="OptiCheck",
    page_icon="🔍",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# Custom CSS for a more modern look
st.markdown("""
<style>
    /* Main container styling */
    .main .block-container {
        padding-top: 2rem;
        padding-bottom: 2rem;
        max-width: 800px;
    }
    
    /* Title styling */
    h1 {
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 1.5rem;
    }
    
    /* Card styling */
    .css-1r6slb0, .css-12oz5g7 {
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        margin-bottom: 1.5rem;
    }
    
    /* Button styling */
    .stButton > button {
        border-radius: 6px;
        font-weight: 500;
        padding: 0.5rem 1rem;
        transition: all 0.2s ease;
    }
    
    /* Primary button */
    .primary-btn button {
        background-color: #3498db;
        color: white;
        border: none;
    }
    
    /* Secondary button */
    .secondary-btn button {
        background-color: #f1f3f5;
        color: #2c3e50;
        border: 1px solid #e9ecef;
    }
    
    /* Success button */
    .success-btn button {
        background-color: #2ecc71;
        color: white;
        border: none;
    }
    
    /* Danger button */
    .danger-btn button {
        background-color: #e74c3c;
        color: white;
        border: none;
    }
    
    /* Alert styling */
    .success-alert {
        padding: 1rem;
        background-color: rgba(46, 204, 113, 0.1);
        border-left: 4px solid #2ecc71;
        border-radius: 4px;
        color: #2c3e50;
        margin-bottom: 1rem;
    }
    
    .warning-alert {
        padding: 1rem;
        background-color: rgba(241, 196, 15, 0.1);
        border-left: 4px solid #f1c40f;
        border-radius: 4px;
        color: #2c3e50;
        margin-bottom: 1rem;
    }
    
    .error-alert {
        padding: 1rem;
        background-color: rgba(231, 76, 60, 0.1);
        border-left: 4px solid #e74c3c;
        border-radius: 4px;
        color: #2c3e50;
        margin-bottom: 1rem;
    }
    
    /* Form styling */
    .stForm {
        background-color: #f8f9fa;
        padding: 1.5rem;
        border-radius: 10px;
        margin-bottom: 1.5rem;
    }
    
    /* Progress bar styling */
    .stProgress > div > div {
        background-color: #3498db;
    }
    
    /* Subheader styling */
    h3 {
        color: #34495e;
        font-weight: 500;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state to manage application flow
if 'page' not in st.session_state:
    st.session_state.page = 'recognition'  # Start with face recognition
if 'user_data' not in st.session_state:
    st.session_state.user_data = None
if 'recognized_name' not in st.session_state:
    st.session_state.recognized_name = None

# ---- GOOGLE SHEETS SETUP ----
SHEET_ID = "1CfCez2g2pgcKmhBxdAth-s-h5Hs8PySVrLQJ6o1vR4w"  # Your Google Sheet ID
SERVICE_ACCOUNT_FILE = "/Users/ronikennedy/Library/Mobile Documents/com~apple~CloudDocs/OptiCheck/backend/opticheck_GS.json"
IMAGE_FOLDER = "/Users/ronikennedy/Library/Mobile Documents/com~apple~CloudDocs/OptiCheck/backend/app/match_images"

# Authenticate Google Sheets API
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name(SERVICE_ACCOUNT_FILE, scope)
client = gspread.authorize(creds)
sheet = client.open_by_key(SHEET_ID).sheet1  # Access first sheet

# Navigation functions
def go_to_user_info():
    st.session_state.page = 'user_info'

def go_to_edit_info():
    st.session_state.page = 'edit_info'

def go_to_vitals_scan():
    st.session_state.page = 'vitals_scan'

def go_to_recognition():
    st.session_state.page = 'recognition'
    st.session_state.recognized_name = None
    st.session_state.user_data = None

# ---- FACE RECOGNITION PAGE ----
def recognition_page():
    st.title("OptiCheck")
    
    with st.container():
        st.markdown("Welcome to OptiCheck, your facial recognition health monitoring system.")
    
    # ---- LOAD REFERENCE IMAGES ----
    reference_encodings = []
    reference_names = []

    # Check if folder exists and has images
    if not os.path.exists(IMAGE_FOLDER) or not os.listdir(IMAGE_FOLDER):
        st.markdown(f'<div class="error-alert">The reference images folder is missing or empty. Please add reference images.</div>', unsafe_allow_html=True)
        st.stop()
    else:
        image_files = [f for f in os.listdir(IMAGE_FOLDER) if f.endswith(('.jpg', '.png'))]
        if not image_files:
            st.markdown(f'<div class="error-alert">No image files found in the folder. Please add valid image files.</div>', unsafe_allow_html=True)
            st.stop()

        for filename in image_files:
            image_path = os.path.join(IMAGE_FOLDER, filename)
            image = face_recognition.load_image_file(image_path)
            encodings = face_recognition.face_encodings(image)
            if encodings:
                reference_encodings.append(encodings[0])
                reference_names.append(filename.split('.')[0])
            else:
                st.markdown(f'<div class="warning-alert">No face found in {filename}. Skipping this file.</div>', unsafe_allow_html=True)

    # ---- INITIALIZE WEBCAM ----
    def capture_video():
        video_capture = cv2.VideoCapture(0)
        if not video_capture.isOpened():
            st.markdown('<div class="error-alert">Unable to access the webcam. Please check permissions in System Preferences > Privacy & Security > Camera.</div>', unsafe_allow_html=True)
            st.stop()

        stframe = st.empty()
        start_time = time.time()
        recognized_name = "Unknown"
        
        # Create a loading indicator
        with st.spinner("Analyzing..."):
            # Run face recognition for 5 seconds
            while time.time() - start_time < 5:
                ret, frame = video_capture.read()
                if not ret:
                    st.markdown('<div class="warning-alert">Failed to capture video. Please ensure the camera is not being used by another application.</div>', unsafe_allow_html=True)
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

    # Start face recognition
    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        start_button = st.empty()
        if start_button.button("Start Face Recognition", key="start_recognition"):
            recognized_name = capture_video()
            st.session_state.recognized_name = recognized_name
            start_button.empty()  # Remove the button after clicking

    # Show recognition results if available
    if st.session_state.recognized_name:
        st.title(f"Identity Verification")
        
        if st.session_state.recognized_name != "Unknown":
            st.markdown(f"We detected you as **{st.session_state.recognized_name}**. Is this correct?")
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.markdown('<div class="primary-btn">', unsafe_allow_html=True)
                if st.button("Yes, that's me"):
                    st.markdown('<div class="success-alert">Identity confirmed. Retrieving your information...</div>', unsafe_allow_html=True)
                    
                    try:
                        # Retrieve user details from Google Sheets
                        users_data = sheet.get_all_records()
                        matched_user = next((user for user in users_data if user.get('Verified Users') == st.session_state.recognized_name), None)
                        
                        if matched_user:
                            st.session_state.user_data = matched_user
                            time.sleep(0.5)  # Short delay for visual feedback
                            st.session_state.page = 'user_info'  # Set page directly instead of using the function
                            st.rerun()  # Use st.rerun() instead of experimental_rerun()
                        else:
                            # Fallback if user not found
                            st.markdown('<div class="warning-alert">User data not found. Creating temporary profile.</div>', unsafe_allow_html=True)
                            # Create fallback user data
                            st.session_state.user_data = {
                                'Verified Users': st.session_state.recognized_name,
                                'Age': 30,
                                'Weight': 150,
                                'Height': 170,
                                'Last Check-in': '2025-02-25',
                                'Blood Pressure': '120/80',
                                'Notes': 'Created from fallback data'
                            }
                            time.sleep(0.5)
                            st.session_state.page = 'user_info'
                            st.rerun()
                    except Exception as e:
                        st.markdown(f'<div class="error-alert">Error connecting to database: {str(e)}</div>', unsafe_allow_html=True)
                        # Create fallback user data
                        st.session_state.user_data = {
                            'Verified Users': st.session_state.recognized_name,
                            'Age': 30,
                            'Weight': 150,
                            'Height': 170,
                            'Last Check-in': '2025-02-25',
                            'Blood Pressure': '120/80',
                            'Notes': 'Created from fallback data'
                        }
                        time.sleep(0.5)
                        st.session_state.page = 'user_info'
                        st.rerun()
                st.markdown('</div>', unsafe_allow_html=True)
            
            with col2:
                st.markdown('<div class="danger-btn">', unsafe_allow_html=True)
                if st.button("No, that's not me"):
                    st.markdown('<div class="warning-alert">Identity verification cancelled. Please try again.</div>', unsafe_allow_html=True)
                    time.sleep(0.5)
                    st.session_state.page = 'recognition'
                    st.session_state.recognized_name = None
                    st.session_state.user_data = None
                    st.rerun()
                st.markdown('</div>', unsafe_allow_html=True)
        else:
            st.markdown('<div class="error-alert">No identity match found. Please try again with better lighting and positioning.</div>', unsafe_allow_html=True)
            st.markdown('<div class="secondary-btn">', unsafe_allow_html=True)
            if st.button("Try Again"):
                st.session_state.page = 'recognition'
                st.session_state.recognized_name = None
                st.rerun()
            st.markdown('</div>', unsafe_allow_html=True)

# ---- USER INFO PAGE ----
def user_info_page():
    st.title(f"Welcome, {st.session_state.recognized_name}")
    
    # Create a card-like container for the user info
    with st.container():
        st.subheader("Your Health Profile")
        
        # Display important metrics
        col1, col2, col3 = st.columns(3)
        
        with col1:
            age = st.session_state.user_data.get('Age', 'N/A')
            st.metric(label="Age", value=age)
        
        with col2:
            weight = st.session_state.user_data.get('Weight', 'N/A')
            if isinstance(weight, (int, float)):
                st.metric(label="Weight", value=f"{weight} lbs")
            else:
                st.metric(label="Weight", value=weight)
        
        with col3:
            height = st.session_state.user_data.get('Height', 'N/A')
            if isinstance(height, (int, float)):
                st.metric(label="Height", value=f"{height} cm")
            else:
                st.metric(label="Height", value=height)
        
        # Display other user information
        st.subheader("Additional Information")
        
        for key, value in st.session_state.user_data.items():
            if key not in ['Verified Users', 'Age', 'Weight', 'Height']:
                st.markdown(f"**{key}:** {value}")
    
    # Navigation buttons
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<div class="secondary-btn">', unsafe_allow_html=True)
        if st.button("Edit Information"):
            st.session_state.page = 'edit_info'
            st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="primary-btn">', unsafe_allow_html=True)
        if st.button("Proceed to Vitals Scan"):
            st.session_state.page = 'vitals_scan'
            st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)

# ---- EDIT INFO PAGE ----
def edit_info_page():
    st.title("Edit Your Health Profile")
    
    # Get user data and row index
    users_data = sheet.get_all_records()
    user_row_idx = next((idx + 2 for idx, user in enumerate(users_data) 
                      if user.get('Verified Users') == st.session_state.recognized_name), None)
    
    # Create a form for editing
    with st.form(key="edit_form"):
        st.markdown("Please update your information below:")
        
        # Create a dictionary to store edited values
        edited_values = {}
        
        # Create form fields for each piece of user data
        for key, value in st.session_state.user_data.items():
            # Skip editing the username/identity field
            if key == 'Verified Users':
                continue
                
            # Create appropriate input fields based on data type
            if isinstance(value, (int, float)):
                if 'age' in key.lower():
                    edited_values[key] = st.number_input(f"{key}", value=value, min_value=0, max_value=120, step=1)
                elif 'weight' in key.lower():
                    edited_values[key] = st.number_input(f"{key} (lbs)", value=value, min_value=0, max_value=500, step=1)
                elif 'height' in key.lower():
                    edited_values[key] = st.number_input(f"{key} (cm)", value=value, min_value=0, max_value=250, step=1)
                else:
                    edited_values[key] = st.number_input(f"{key}", value=value)
            elif isinstance(value, bool):
                edited_values[key] = st.checkbox(f"{key}", value=value)
            elif 'date' in key.lower() or 'check-in' in key.lower():
                edited_values[key] = st.date_input(f"{key}", value=None)
            elif 'notes' in key.lower() or 'comment' in key.lower():
                edited_values[key] = st.text_area(f"{key}", value=value)
            else:
                edited_values[key] = st.text_input(f"{key}", value=value)
        
        # Submit button
        st.markdown('<div class="primary-btn">', unsafe_allow_html=True)
        submit_button = st.form_submit_button(label="Save Changes")
        st.markdown('</div>', unsafe_allow_html=True)
        
        if submit_button:
            try:
                # Update Google Sheets with edited values if we have a valid row
                if user_row_idx:
                    for key, value in edited_values.items():
                        # Find the column index
                        header_row = sheet.row_values(1)
                        if key in header_row:
                            col_letter = chr(65 + header_row.index(key))  # Convert to A, B, C, etc.
                            
                            # Update the specific cell
                            sheet.update_acell(f"{col_letter}{user_row_idx}", value)
                
                # Update session state with new values regardless of sheet update
                st.session_state.user_data.update(edited_values)
                
                st.markdown('<div class="success-alert">Information updated successfully!</div>', unsafe_allow_html=True)
                time.sleep(0.8)  # Short delay for visual feedback
                st.session_state.page = 'user_info'
                st.rerun()
                
            except Exception as e:
                st.markdown(f'<div class="error-alert">Error updating information: {str(e)}</div>', unsafe_allow_html=True)
                # Still update local data
                st.session_state.user_data.update(edited_values)
                time.sleep(0.8)
                st.session_state.page = 'user_info'
                st.rerun()
    
    # Back button outside the form
    st.markdown('<div class="secondary-btn">', unsafe_allow_html=True)
    if st.button("Cancel"):
        st.session_state.page = 'user_info'
        st.rerun()
    st.markdown('</div>', unsafe_allow_html=True)

# ---- VITALS SCAN PAGE ----
def vitals_scan_page():
    st.title("Vitals Scan")
    
    with st.container():
        st.markdown(f"Hello {st.session_state.recognized_name}, we'll now scan your vital signs.")
        st.markdown("This feature will integrate with health monitoring technology to provide real-time vital sign measurements.")
    
    # Mock scan interface
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.subheader("Scan Instructions")
        st.markdown("1. Position your face clearly in front of the camera")
        st.markdown("2. Stay still for the duration of the scan (30 seconds)")
        st.markdown("3. Breathe normally and maintain a neutral expression")
        st.markdown("4. Ensure good lighting on your face")
    
    with col2:
        # Placeholder for scan initiation
        st.markdown('<div class="primary-btn">', unsafe_allow_html=True)
        scan_button = st.button("Begin Vitals Scan")
        st.markdown('</div>', unsafe_allow_html=True)
    
    if scan_button:
        # Show a progress bar to simulate scanning
        st.subheader("Scanning in progress...")
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        for i in range(101):
            # Update progress bar
            progress_bar.progress(i)
            
            # Update status text based on progress
            if i < 30:
                status_text.markdown("Initializing scan and calibrating sensors...")
            elif i < 60:
                status_text.markdown("Analyzing facial blood flow patterns...")
            elif i < 90:
                status_text.markdown("Processing vital signs data...")
            else:
                status_text.markdown("Finalizing results and generating report...")
            
            time.sleep(0.05)  # Add small delay for visual effect
        
        st.markdown('<div class="success-alert">Scan completed successfully!</div>', unsafe_allow_html=True)
        
        # Display mock vitals data in a modern card layout
        st.subheader("Your Vital Signs")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.metric(label="Heart Rate", value="72 bpm", delta="Normal")
            st.metric(label="Blood Pressure", value="120/80 mmHg", delta="Normal")
        
        with col2:
            st.metric(label="Respiratory Rate", value="16 breaths/min", delta="Normal")
            st.metric(label="Stress Level", value="Low", delta="Good")
        
        # Recommendations based on vitals
        st.subheader("Recommendations")
        st.markdown("- Your vital signs are within normal ranges")
        st.markdown("- Continue with your current exercise routine")
        st.markdown("- Maintain your hydration levels")
        st.markdown("- Next recommended check-in: 7 days")
    
    # Navigation buttons
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<div class="secondary-btn">', unsafe_allow_html=True)
        if st.button("Back to Profile"):
            st.session_state.page = 'user_info'
            st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="danger-btn">', unsafe_allow_html=True)
        if st.button("End Session"):
            st.session_state.page = 'recognition'
            st.session_state.recognized_name = None
            st.session_state.user_data = None
            st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)

# ---- MAIN APP LOGIC ----
# Display the appropriate page based on state
if st.session_state.page == 'recognition':
    recognition_page()
elif st.session_state.page == 'user_info':
    user_info_page()
elif st.session_state.page == 'edit_info':
    edit_info_page()
elif st.session_state.page == 'vitals_scan':
    vitals_scan_page()