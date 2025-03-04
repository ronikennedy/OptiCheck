import React from 'react';
import { Link } from 'react-router-dom';

const CVViewer = ({ cvData, showEdit = true }) => {
  if (!cvData) {
    return (
      <div className="cv-viewer cv-viewer--empty">
        <div className="cv-viewer__message">
          <h3>No CV data available</h3>
          <p>Start by adding your information</p>
          {showEdit && (
            <Link to="/cv/edit" className="button button--primary">
              Create CV
            </Link>
          )}
        </div>
      </div>
    );
  }

  const {
    personal_info = {},
    education = [],
    work_experience = [],
    skills = [],
    projects = [],
    certifications = [],
    languages = []
  } = cvData;

  return (
    <div className="cv-viewer">
      {showEdit && (
        <div className="cv-viewer__actions">
          <Link to="/cv/edit" className="button button--primary">
            Edit CV
          </Link>
        </div>
      )}

      <div className="cv-section cv-section--header">
        <h1 className="cv-name">{personal_info.name || 'Your Name'}</h1>
        
        <div className="cv-contact-details">
          {personal_info.email && (
            <div className="cv-contact-item">
              <i className="icon icon-email"></i> {personal_info.email}
            </div>
          )}
          
          {personal_info.phone && (
            <div className="cv-contact-item">
              <i className="icon icon-phone"></i> {personal_info.phone}
            </div>
          )}
          
          {personal_info.linkedin && (
            <div className="cv-contact-item">
              <i className="icon icon-linkedin"></i> {personal_info.linkedin}
            </div>
          )}
          
          {personal_info.website && (
            <div className="cv-contact-item">
              <i className="icon icon-website"></i> {personal_info.website}
            </div>
          )}
        </div>
      </div>

      {personal_info.summary && (
        <div className="cv-section">
          <h2 className="cv-section__title">Skills</h2>
          
          <div className="cv-section__content">
            <div className="cv-skills">
              {skills.map((skill, index) => (
                <div className="cv-skill" key={index}>
                  <span className="cv-skill__name">{skill.name}</span>
                  {skill.level && (
                    <span className="cv-skill__level">
                      <div 
                        className="cv-skill__level-bar" 
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {projects.length > 0 && (
        <div className="cv-section">
          <h2 className="cv-section__title">Projects</h2>
          
          <div className="cv-section__content">
            {projects.map((project, index) => (
              <div className="cv-item" key={index}>
                <div className="cv-item__header">
                  <h3 className="cv-item__title">{project.name}</h3>
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="cv-item__link">
                      View Project
                    </a>
                  )}
                </div>
                
                <div className="cv-item__description">
                  <p>{project.description}</p>
                  
                  {project.technologies && (
                    <div className="cv-item__tags">
                      {project.technologies.map((tech, idx) => (
                        <span className="cv-tag" key={idx}>{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {certifications.length > 0 && (
        <div className="cv-section">
          <h2 className="cv-section__title">Certifications</h2>
          
          <div className="cv-section__content">
            <div className="cv-certifications">
              {certifications.map((cert, index) => (
                <div className="cv-certification" key={index}>
                  <h3 className="cv-certification__name">{cert.name}</h3>
                  <div className="cv-certification__issuer">{cert.issuer}</div>
                  {cert.date && <div className="cv-certification__date">{cert.date}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {languages.length > 0 && (
        <div className="cv-section">
          <h2 className="cv-section__title">Languages</h2>
          
          <div className="cv-section__content">
            <div className="cv-languages">
              {languages.map((lang, index) => (
                <div className="cv-language" key={index}>
                  <span className="cv-language__name">{lang.name}</span>
                  <span className="cv-language__level">{lang.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};className="cv-section__title">Summary</h2>
          <p className="cv-section__summary">{personal_info.summary}</p>
        </div>
      )}

      {work_experience.length > 0 && (
        <div className="cv-section">
          <h2 className="cv-section__title">Work Experience</h2>
          
          <div className="cv-section__content">
            {work_experience.map((job, index) => (
              <div className="cv-item" key={index}>
                <div className="cv-item__header">
                  <h3 className="cv-item__title">{job.position}</h3>
                  <div className="cv-item__company">{job.company}</div>
                  <div className="cv-item__period">{job.start_date} - {job.end_date || 'Present'}</div>
                </div>
                
                <div className="cv-item__description">
                  <p>{job.description}</p>
                  
                  {job.achievements && job.achievements.length > 0 && (
                    <ul className="cv-item__achievements">
                      {job.achievements.map((achievement, idx) => (
                        <li key={idx}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {education.length > 0 && (
        <div className="cv-section">
          <h2 className="cv-section__title">Education</h2>
          
          <div className="cv-section__content">
            {education.map((edu, index) => (
              <div className="cv-item" key={index}>
                <div className="cv-item__header">
                  <h3 className="cv-item__title">{edu.degree}</h3>
                  <div className="cv-item__institution">{edu.institution}</div>
                  <div className="cv-item__period">{edu.start_date} - {edu.end_date || 'Present'}</div>
                </div>
                
                {edu.description && (
                  <div className="cv-item__description">
                    <p>{edu.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="cv-section">
          <h2