import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { FaPhone, FaInstagram, FaMapMarkerAlt, FaFutbol } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="app-footer py-4 mt-auto">
      <div className="container">
        <Row className="mb-3">
          <Col md={4} className="mb-3 mb-md-0 text-center text-md-start">
            <h5 className="footer-title mb-3">Contatti</h5>
            <p className="mb-2">
              <FaPhone className="me-2 footer-icon" /> +39 339 4050831
            </p>
            <p className="mb-2">
              <FaPhone className="me-2 footer-icon" /> +39 342 0740629
            </p>
            <p className="mb-2">
              <FaPhone className="me-2 footer-icon" /> +39 331 3104881
            </p>
          </Col>
          
          <Col md={4} className="mb-3 mb-md-0 text-center">
            <h5 className="footer-title mb-3">Seguici</h5>
            <p className="mb-2">
              <FaInstagram className="me-2 footer-icon" /> 
              <a 
                href="https://www.instagram.com/mazzarino_summercup" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-link"
              >
                @mazzarino_summercup
              </a>
            </p>
            <p className="mb-2">
              <FaFutbol className="me-2 footer-icon" /> 
              <a 
                href="https://fantamazzarinosummercup.fun/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="footer-link"
              >
                Fantatorneo App
              </a>
            </p>
          </Col>
          
          <Col md={4} className="text-center text-md-end">
            <h5 className="footer-title mb-3">Dove siamo</h5>
            <p className="mb-2">
              <FaMapMarkerAlt className="me-2 footer-icon" /> Impianto Sportivo Bo.Ca.Si.
            </p>
            <p className="mb-2">
              C/da Madonna delle Grazie - Mazzarino (CL)
            </p>
          </Col>
        </Row>
        
        <hr className="footer-divider my-3" />
        
        <div className="text-center">
          <p className="mb-0">© {new Date().getFullYear()} Fantatorneo. Created by Giuseppe Capizzi.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
