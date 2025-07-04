import { useState, useRef } from "react";
import analytics from "../utils/analytics";
import { plantRecognition } from "../utils/plantRecognition";

const PlantScanner = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [healthAssessment, setHealthAssessment] = useState(null);
  const [showHealthTab, setShowHealthTab] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
        setResult(null);
        analytics.track("plant_scanner_image_uploaded", {
          fileSize: file.size,
          fileType: file.type,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setResult(null);
    setHealthAssessment(null);
    analytics.track("plant_scanner_analysis_started");

    try {
      // Use the plant recognition utility
      const plantResult = await plantRecognition.analyzeImage(selectedImage);
      const healthResult = plantRecognition.assessPlantHealth(selectedImage);

      setResult(plantResult);
      setHealthAssessment(healthResult);
      setIsAnalyzing(false);

      analytics.track("plant_scanner_analysis_completed", {
        plantName: plantResult.name,
        confidence: Math.round(plantResult.confidence * 100),
        healthScore: healthResult.overallScore,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      setIsAnalyzing(false);
      analytics.track("plant_scanner_analysis_failed", {
        error: error.message,
      });
    }
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setResult(null);
    setHealthAssessment(null);
    setShowHealthTab(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="plant-scanner">
      <div className="container" style={{ marginTop: 210 }}>
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-4">
              <h2 className="mb-3">Plant Scanner</h2>
              <p className="text-muted">
                Upload a photo of your plant and we'll help identify it for you!
              </p>
            </div>

            <div className="card">
              <div className="card-body">
                {!selectedImage ? (
                  <div className="upload-area text-center p-5">
                    <div className="upload-placeholder mb-3">
                      <i className="fas fa-camera fa-3x text-muted mb-3"></i>
                      <h5>Upload Plant Photo</h5>
                      <p className="text-muted">
                        Take a clear photo of your plant's leaves and overall
                        structure
                      </p>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="d-none"
                      capture="environment"
                    />
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <i className="fas fa-upload me-2"></i>
                      Choose Photo
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="uploaded-image text-center mb-4">
                      <img
                        src={selectedImage}
                        alt="Uploaded plant"
                        className="img-fluid rounded"
                        style={{ maxHeight: "300px", objectFit: "contain" }}
                      />
                    </div>

                    <div className="scanner-actions text-center mb-4">
                      {!result && (
                        <button
                          className="btn btn-success btn-lg me-3"
                          onClick={analyzeImage}
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-search me-2"></i>
                              Identify Plant
                            </>
                          )}
                        </button>
                      )}
                      <button
                        className="btn btn-outline-secondary"
                        onClick={resetScanner}
                      >
                        <i className="fas fa-redo me-2"></i>
                        Try Another Photo
                      </button>
                    </div>

                    {result && (
                      <div className="analysis-result">
                        <div className="alert alert-success">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h5 className="mb-0">
                              <i className="fas fa-check-circle me-2"></i>
                              Plant Identified!
                            </h5>
                            <span className="badge bg-success">
                              {Math.round(result.confidence * 100)}% confidence
                            </span>
                          </div>
                        </div>

                        {/* Tabs for Plant Info and Health Assessment */}
                        <ul className="nav nav-tabs mb-3">
                          <li className="nav-item">
                            <button
                              className={`nav-link ${
                                !showHealthTab ? "active" : ""
                              }`}
                              onClick={() => setShowHealthTab(false)}
                            >
                              Plant Information
                            </button>
                          </li>
                          <li className="nav-item">
                            <button
                              className={`nav-link ${
                                showHealthTab ? "active" : ""
                              }`}
                              onClick={() => setShowHealthTab(true)}
                            >
                              Health Assessment
                            </button>
                          </li>
                        </ul>

                        {!showHealthTab ? (
                          <div className="row">
                            <div className="col-md-6">
                              <h4>{result.name}</h4>
                              <p className="text-muted fst-italic mb-2">
                                {result.scientificName}
                              </p>
                              <p>{result.description}</p>

                              <h6>Care Instructions:</h6>
                              <ul className="list-unstyled">
                                {result.care.map((instruction, index) => (
                                  <li key={index} className="mb-1">
                                    <i className="fas fa-leaf text-success me-2"></i>
                                    {instruction}
                                  </li>
                                ))}
                              </ul>

                              <h6>Plant Characteristics:</h6>
                              <div className="characteristics mb-3">
                                {result.characteristics.map((char, index) => (
                                  <span
                                    key={index}
                                    className="badge bg-light text-dark me-1 mb-1"
                                  >
                                    {char}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="col-md-6">
                              <div className="card bg-light">
                                <div className="card-body text-center">
                                  <h6 className="card-title">
                                    Available in Store
                                  </h6>
                                  <div className="price mb-2">
                                    <span className="h4 text-success">
                                      ₹{result.price}
                                    </span>
                                  </div>
                                  <span className="badge bg-success mb-3">
                                    {result.availability}
                                  </span>
                                  <div className="d-grid gap-2">
                                    <button className="btn btn-primary">
                                      <i className="fas fa-shopping-cart me-2"></i>
                                      Buy This Plant
                                    </button>
                                    <button className="btn btn-outline-primary">
                                      <i className="fas fa-info-circle me-2"></i>
                                      View Details
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          healthAssessment && (
                            <div className="health-assessment">
                              <div className="row">
                                <div className="col-md-6">
                                  <div className="health-score text-center mb-4">
                                    <div
                                      className="score-circle mx-auto mb-2"
                                      style={{
                                        width: "120px",
                                        height: "120px",
                                        borderRadius: "50%",
                                        background: `conic-gradient(#28a745 ${
                                          healthAssessment.overallScore * 3.6
                                        }deg, #e9ecef 0deg)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "24px",
                                        fontWeight: "bold",
                                        color: "#28a745",
                                      }}
                                    >
                                      {healthAssessment.overallScore}%
                                    </div>
                                    <h6>Overall Health Score</h6>
                                  </div>
                                </div>
                                <div className="col-md-6">
                                  <h6>Health Factors:</h6>
                                  {healthAssessment.factors.map(
                                    (factor, index) => (
                                      <div
                                        key={index}
                                        className="d-flex justify-content-between align-items-center mb-2"
                                      >
                                        <span>{factor.factor}:</span>
                                        <div>
                                          <span
                                            className={`badge ${
                                              factor.score >= 85
                                                ? "bg-success"
                                                : factor.score >= 70
                                                ? "bg-warning"
                                                : "bg-danger"
                                            }`}
                                          >
                                            {factor.status}
                                          </span>
                                          <small className="text-muted ms-2">
                                            ({factor.score}%)
                                          </small>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>

                              <div className="recommendations mt-3">
                                <h6>Recommendations:</h6>
                                <ul className="list-unstyled">
                                  {healthAssessment.recommendations.map(
                                    (rec, index) => (
                                      <li key={index} className="mb-1">
                                        <i className="fas fa-lightbulb text-warning me-2"></i>
                                        {rec}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="scanner-tips mt-4">
              <h6>Tips for better results:</h6>
              <div className="row">
                <div className="col-md-4 text-center mb-3">
                  <i className="fas fa-sun fa-2x text-warning mb-2"></i>
                  <p className="small">Use good lighting</p>
                </div>
                <div className="col-md-4 text-center mb-3">
                  <i className="fas fa-focus text-primary fa-2x mb-2"></i>
                  <p className="small">Keep image in focus</p>
                </div>
                <div className="col-md-4 text-center mb-3">
                  <i className="fas fa-leaf text-success fa-2x mb-2"></i>
                  <p className="small">Show leaves clearly</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlantScanner;
