import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import LazyImage from "../components/LazyImage";

export default function PlantScanner() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  // Mock plant database - in real app, this would connect to a plant recognition API
  const plantDatabase = [
    {
      id: 1,
      name: "Monstera Deliciosa",
      scientificName: "Monstera deliciosa",
      commonNames: ["Swiss Cheese Plant", "Split-Leaf Philodendron"],
      category: "indoor",
      careLevel: "easy",
      light: "bright indirect",
      water: "moderate",
      humidity: "high",
      temperature: "18-27°C",
      description:
        "A popular tropical plant known for its distinctive split leaves. Perfect for adding a jungle vibe to any room.",
      careTips: [
        "Water when top 2-3 inches of soil is dry",
        "Provide bright, indirect light",
        "Mist leaves regularly for humidity",
        "Fertilize monthly during growing season",
      ],
      problems: [
        "Yellow leaves: Usually overwatering",
        "Brown tips: Low humidity",
        "No splits: Insufficient light",
      ],
      image: "/plant1.gif",
      price: "₹1299",
      originalPrice: "₹1599",
      rating: 4.8,
      inStock: true,
      onSale: true,
    },
    {
      id: 2,
      name: "Snake Plant",
      scientificName: "Sansevieria trifasciata",
      commonNames: ["Mother-in-Law's Tongue", "Viper's Bowstring Hemp"],
      category: "indoor",
      careLevel: "very-easy",
      light: "low to bright",
      water: "low",
      humidity: "low",
      temperature: "15-30°C",
      description:
        "An extremely hardy plant that's perfect for beginners. Known for its air-purifying qualities and low maintenance needs.",
      careTips: [
        "Water sparingly - let soil dry completely",
        "Tolerates low light conditions",
        "No need for frequent repotting",
        "Drought-tolerant and forgiving",
      ],
      problems: [
        "Root rot: Overwatering",
        "Soft leaves: Too much water",
        "Slow growth: Normal in low light",
      ],
      image: "/plant1.gif",
      price: "₹899",
      originalPrice: "₹899",
      rating: 4.6,
      inStock: true,
      onSale: false,
    },
    {
      id: 3,
      name: "Peace Lily",
      scientificName: "Spathiphyllum",
      commonNames: ["White Sails", "Cobra Plant"],
      category: "indoor",
      careLevel: "easy",
      light: "medium indirect",
      water: "high",
      humidity: "high",
      temperature: "18-24°C",
      description:
        "A beautiful flowering plant that's excellent for air purification. Known for its elegant white flowers and lush green leaves.",
      careTips: [
        "Keep soil consistently moist",
        "Provide bright, indirect light",
        "High humidity preferred",
        "Remove spent flowers regularly",
      ],
      problems: [
        "Drooping leaves: Needs water",
        "No flowers: Insufficient light",
        "Brown tips: Low humidity or over-fertilizing",
      ],
      image: "/plant1.gif",
      price: "₹699",
      originalPrice: "₹899",
      rating: 4.7,
      inStock: true,
      onSale: true,
    },
  ];

  const requestCameraPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setCameraPermission("granted");
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setShowCamera(true);
      setShowUpload(false);
    } catch (err) {
      console.error("Camera permission denied:", err);
      setCameraPermission("denied");
      setError(
        "Camera access is required for plant scanning. Please enable camera permissions."
      );
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
    setCameraPermission(null);
  }, []);

  const captureImage = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      context.drawImage(videoRef.current, 0, 0);

      canvasRef.current.toBlob(
        (blob) => {
          if (blob) {
            const imageUrl = URL.createObjectURL(blob);
            setSelectedImage(imageUrl);
            stopCamera();
            scanPlant(imageUrl);
          }
        },
        "image/jpeg",
        0.8
      );
    }
  }, [stopCamera]);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setShowUpload(false);
      scanPlant(imageUrl);
    }
  }, []);

  const scanPlant = useCallback(async (imageUrl) => {
    setIsLoading(true);
    setError(null);

    // Simulate API call delay
    setTimeout(() => {
      // Mock plant recognition - in real app, this would send image to plant recognition API
      const randomPlant =
        plantDatabase[Math.floor(Math.random() * plantDatabase.length)];

      setScanResult({
        plant: randomPlant,
        confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
        scanTime: new Date().toISOString(),
      });

      setIsLoading(false);
    }, 2000);
  }, []);

  const handleAddToCart = (plant) => {
    addToCart(plant, 1);
  };

  const handleWishlistToggle = (plant) => {
    if (isInWishlist(plant.id)) {
      removeFromWishlist(plant.id);
    } else {
      addToWishlist(plant);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setSelectedImage(null);
    setError(null);
    setShowCamera(false);
    setShowUpload(false);
    setCameraPermission(null);
  };

  const openUploadDialog = () => {
    setShowUpload(true);
    setShowCamera(false);
    if (streamRef.current) {
      stopCamera();
    }
  };

  return (
    <div className="plant-scanner-container">
      <style>
        {`
          .plant-scanner-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            min-height: 100vh;
          }
          
          .scanner-header {
            text-align: center;
            margin-bottom: 40px;
          }
          
          .scanner-title {
            font-size: 3rem;
            font-weight: 700;
            color: #2B5943;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
          }
          
          .scanner-subtitle {
            font-size: 1.2rem;
            color: #666;
            max-width: 600px;
            margin: 0 auto;
            line-height: 1.6;
          }
          
          .scanner-modes {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
          }
          
          .scanner-mode {
            background: white;
            border-radius: 20px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
            cursor: pointer;
            border: 2px solid transparent;
          }
          
          .scanner-mode:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
            border-color: #6A9304;
          }
          
          .scanner-mode.active {
            border-color: #6A9304;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          }
          
          .mode-icon {
            font-size: 4rem;
            color: #6A9304;
            margin-bottom: 20px;
          }
          
          .mode-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
          }
          
          .mode-description {
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
          }
          
          .mode-button {
            background: linear-gradient(135deg, #6A9304, #8BC34A);
            color: white;
            border: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(106, 147, 4, 0.3);
          }
          
          .mode-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(106, 147, 4, 0.4);
          }
          
          .mode-button:disabled {
            background: #6c757d;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          
          .camera-container {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            text-align: center;
          }
          
          .camera-video {
            width: 100%;
            max-width: 640px;
            border-radius: 16px;
            margin-bottom: 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          
          .camera-controls {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
          }
          
          .camera-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .camera-btn.primary {
            background: #6A9304;
            color: white;
          }
          
          .camera-btn.primary:hover {
            background: #5a7d03;
            transform: translateY(-2px);
          }
          
          .camera-btn.secondary {
            background: #6c757d;
            color: white;
          }
          
          .camera-btn.secondary:hover {
            background: #5a6268;
            transform: translateY(-2px);
          }
          
          .camera-btn.danger {
            background: #dc3545;
            color: white;
          }
          
          .camera-btn.danger:hover {
            background: #c82333;
            transform: translateY(-2px);
          }
          
          .upload-container {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
            text-align: center;
          }
          
          .upload-area {
            border: 3px dashed #6A9304;
            border-radius: 16px;
            padding: 60px 20px;
            margin-bottom: 20px;
            background: rgba(106, 147, 4, 0.05);
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .upload-area:hover {
            background: rgba(106, 147, 4, 0.1);
            border-color: #5a7d03;
          }
          
          .upload-icon {
            font-size: 4rem;
            color: #6A9304;
            margin-bottom: 20px;
          }
          
          .upload-text {
            font-size: 1.2rem;
            color: #333;
            margin-bottom: 10px;
          }
          
          .upload-hint {
            color: #666;
            font-size: 0.9rem;
          }
          
          .hidden-input {
            display: none;
          }
          
          .scan-result {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          }
          
          .result-header {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f8f9fa;
          }
          
          .result-image {
            width: 120px;
            height: 120px;
            border-radius: 16px;
            object-fit: cover;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          
          .result-info {
            flex: 1;
          }
          
          .result-name {
            font-size: 2rem;
            font-weight: 700;
            color: #333;
            margin-bottom: 8px;
          }
          
          .result-scientific {
            font-style: italic;
            color: #666;
            margin-bottom: 8px;
            font-size: 1.1rem;
          }
          
          .result-confidence {
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 0.9rem;
            display: inline-block;
          }
          
          .result-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .detail-section {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 20px;
            border-left: 4px solid #6A9304;
          }
          
          .detail-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .detail-content {
            color: #666;
            line-height: 1.6;
          }
          
          .care-tips {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
          }
          
          .care-tips h4 {
            color: #856404;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .care-tips ul {
            margin: 0;
            padding-left: 20px;
            color: #856404;
          }
          
          .care-tips li {
            margin-bottom: 8px;
            line-height: 1.5;
          }
          
          .result-actions {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #f8f9fa;
          }
          
          .action-btn {
            padding: 15px 30px;
            border: none;
            border-radius: 25px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1rem;
          }
          
          .action-btn.primary {
            background: #6A9304;
            color: white;
          }
          
          .action-btn.primary:hover {
            background: #5a7d03;
            transform: translateY(-2px);
          }
          
          .action-btn.secondary {
            background: #6c757d;
            color: white;
          }
          
          .action-btn.secondary:hover {
            background: #5a6268;
            transform: translateY(-2px);
          }
          
          .action-btn.success {
            background: #28a745;
            color: white;
          }
          
          .action-btn.success:hover {
            background: #218838;
            transform: translateY(-2px);
          }
          
          .action-btn.danger {
            background: #ff6b6b;
            color: white;
          }
          
          .action-btn.danger:hover {
            background: #ee5a24;
            transform: translateY(-2px);
          }
          
          .loading-container {
            text-align: center;
            padding: 60px 20px;
            color: #666;
          }
          
          .loading-spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #6A9304;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .error-container {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
            color: #721c24;
            text-align: center;
          }
          
          .error-icon {
            font-size: 3rem;
            margin-bottom: 15px;
            color: #dc3545;
          }
          
          .canvas-hidden {
            position: absolute;
            left: -9999px;
          }
          
          @media (max-width: 768px) {
            .plant-scanner-container {
              padding: 15px;
            }
            
            .scanner-title {
              font-size: 2.5rem;
              flex-direction: column;
              gap: 10px;
            }
            
            .scanner-modes {
              grid-template-columns: 1fr;
            }
            
            .result-header {
              flex-direction: column;
              text-align: center;
            }
            
            .result-details {
              grid-template-columns: 1fr;
            }
            
            .result-actions {
              flex-direction: column;
              align-items: center;
            }
            
            .action-btn {
              width: 100%;
              max-width: 300px;
              justify-content: center;
            }
          }
        `}
      </style>

      <div className="scanner-header">
        <h1 className="scanner-title">
          <i className="fas fa-camera" style={{ color: "#6A9304" }}></i>
          Plant Scanner
          <i className="fas fa-leaf" style={{ color: "#8BC34A" }}></i>
        </h1>
        <p className="scanner-subtitle">
          Identify plants instantly with our AI-powered scanner. Get detailed
          care instructions, care tips, and add plants to your collection with
          just a photo!
        </p>
      </div>

      {!scanResult && !isLoading && !error && (
        <div className="scanner-modes">
          <div className={`scanner-mode ${showCamera ? "active" : ""}`}>
            <div className="mode-icon">
              <i className="fas fa-camera"></i>
            </div>
            <h3 className="mode-title">Camera Scan</h3>
            <p className="mode-description">
              Use your device's camera to scan plants in real-time. Perfect for
              identifying plants while you're out exploring or shopping.
            </p>
            <button
              className="mode-button"
              onClick={requestCameraPermission}
              disabled={cameraPermission === "denied"}
            >
              <i className="fas fa-camera me-2"></i>
              {cameraPermission === "denied"
                ? "Camera Blocked"
                : "Start Camera"}
            </button>
          </div>

          <div className={`scanner-mode ${showUpload ? "active" : ""}`}>
            <div className="mode-icon">
              <i className="fas fa-upload"></i>
            </div>
            <h3 className="mode-title">Upload Image</h3>
            <p className="mode-description">
              Upload a photo from your gallery to identify plants. Great for
              photos you've already taken or images from the internet.
            </p>
            <button className="mode-button" onClick={openUploadDialog}>
              <i className="fas fa-upload me-2"></i>
              Choose Image
            </button>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="camera-container">
          <h3 className="mb-3">
            <i className="fas fa-camera me-2" style={{ color: "#6A9304" }}></i>
            Camera Scanner
          </h3>
          <video
            ref={videoRef}
            className="camera-video"
            autoPlay
            playsInline
            muted
          />
          <div className="camera-controls">
            <button className="camera-btn primary" onClick={captureImage}>
              <i className="fas fa-camera"></i>
              Capture Plant
            </button>
            <button className="camera-btn secondary" onClick={openUploadDialog}>
              <i className="fas fa-upload"></i>
              Upload Instead
            </button>
            <button className="camera-btn danger" onClick={stopCamera}>
              <i className="fas fa-times"></i>
              Close Camera
            </button>
          </div>
        </div>
      )}

      {showUpload && (
        <div className="upload-container">
          <h3 className="mb-3">
            <i className="fas fa-upload me-2" style={{ color: "#6A9304" }}></i>
            Upload Image
          </h3>
          <div
            className="upload-area"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">
              <i className="fas fa-cloud-upload-alt"></i>
            </div>
            <div className="upload-text">Click to upload an image</div>
            <div className="upload-hint">Supports JPG, PNG, GIF up to 10MB</div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden-input"
          />
          <button
            className="camera-btn secondary"
            onClick={() => setShowUpload(false)}
          >
            <i className="fas fa-arrow-left me-2"></i>
            Back to Scanner
          </button>
        </div>
      )}

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <h3>Analyzing Plant Image...</h3>
          <p>Our AI is identifying your plant and gathering care information</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Scanning Error</h3>
          <p>{error}</p>
          <button
            className="action-btn secondary"
            onClick={() => setError(null)}
          >
            <i className="fas fa-redo me-2"></i>
            Try Again
          </button>
        </div>
      )}

      {scanResult && (
        <div className="scan-result">
          <div className="result-header">
            <LazyImage
              src={selectedImage || scanResult.plant.image}
              alt={scanResult.plant.name}
              className="result-image"
              fallbackSrc="/plant1.gif"
            />
            <div className="result-info">
              <h2 className="result-name">{scanResult.plant.name}</h2>
              <p className="result-scientific">
                {scanResult.plant.scientificName}
              </p>
              <div className="result-confidence">
                {Math.round(scanResult.confidence * 100)}% Confidence
              </div>
            </div>
          </div>

          <div className="result-details">
            <div className="detail-section">
              <h4 className="detail-title">
                <i
                  className="fas fa-info-circle"
                  style={{ color: "#6A9304" }}
                ></i>
                Plant Information
              </h4>
              <div className="detail-content">
                <p>
                  <strong>Category:</strong> {scanResult.plant.category}
                </p>
                <p>
                  <strong>Care Level:</strong> {scanResult.plant.careLevel}
                </p>
                <p>
                  <strong>Common Names:</strong>{" "}
                  {scanResult.plant.commonNames.join(", ")}
                </p>
                <p>{scanResult.plant.description}</p>
              </div>
            </div>

            <div className="detail-section">
              <h4 className="detail-title">
                <i className="fas fa-sun" style={{ color: "#ffc107" }}></i>
                Care Requirements
              </h4>
              <div className="detail-content">
                <p>
                  <strong>Light:</strong> {scanResult.plant.light}
                </p>
                <p>
                  <strong>Water:</strong> {scanResult.plant.water}
                </p>
                <p>
                  <strong>Humidity:</strong> {scanResult.plant.humidity}
                </p>
                <p>
                  <strong>Temperature:</strong> {scanResult.plant.temperature}
                </p>
              </div>
            </div>
          </div>

          <div className="care-tips">
            <h4>
              <i className="fas fa-lightbulb" style={{ color: "#ffc107" }}></i>
              Care Tips
            </h4>
            <ul>
              {scanResult.plant.careTips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>

          <div className="result-actions">
            <button
              className="action-btn primary"
              onClick={() => handleAddToCart(scanResult.plant)}
            >
              <i className="fas fa-shopping-cart"></i>
              Add to Cart - {scanResult.plant.price}
            </button>

            <button
              className={`action-btn ${
                isInWishlist(scanResult.plant.id) ? "danger" : "success"
              }`}
              onClick={() => handleWishlistToggle(scanResult.plant)}
            >
              <i
                className={`fas ${
                  isInWishlist(scanResult.plant.id)
                    ? "fa-heart-broken"
                    : "fa-heart"
                }`}
              ></i>
              {isInWishlist(scanResult.plant.id)
                ? "Remove from Wishlist"
                : "Add to Wishlist"}
            </button>

            <button
              className="action-btn secondary"
              onClick={() => navigate(`/product/${scanResult.plant.id}`)}
            >
              <i className="fas fa-eye"></i>
              View Full Details
            </button>

            <button className="action-btn secondary" onClick={resetScanner}>
              <i className="fas fa-redo"></i>
              Scan Another Plant
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="canvas-hidden" />
    </div>
  );
}
