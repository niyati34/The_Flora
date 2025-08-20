# � The Flora - Plant E-commerce Platform

A modern, feature-rich e-commerce platform for plants and gardening products built with React, featuring advanced plant recognition, customer support chat, and comprehensive shopping features.

## ✨ Features

### 🛒 Core E-commerce
- **Product Catalog**: Browse plants by categories (Air Purifying, Indoor, Low Maintenance)
- **Shopping Cart**: Add/remove items with color variants and quantity management
- **Wishlist & Compare**: Save favorites and compare up to 3 products
- **Wallet System**: Digital wallet with top-up and checkout functionality

### 🔍 Plant Scanner
- **AI Plant Recognition**: Upload photos to identify plants (mock AI implementation)
- **Health Assessment**: Analyze plant health with detailed recommendations
- **Care Guides**: Personalized care instructions for identified plants

### 💬 Customer Support
- **Live Chat Widget**: Interactive customer support with keyword-based responses
- **Quick Questions**: Pre-defined common plant care questions
- **Analytics Integration**: Track support interactions and user behavior

### 📱 User Experience
- **Responsive Design**: Bootstrap-powered responsive UI
- **Lazy Loading**: Optimized image loading with intersection observer
- **Analytics**: Comprehensive user behavior tracking
- **Keyboard Shortcuts**: Power user features (Ctrl+K for search, etc.)
- **Auto-save**: Draft saving for reviews and notes

### 💾 Advanced Features
- **Price Alerts**: Get notified when products go on sale
- **Care Reminders**: Set watering and care schedules
- **Notes System**: Add personal notes to products
- **Recent Views**: Track recently viewed products
- **Stock Management**: Real-time inventory tracking

## 🚀 Tech Stack

- **Frontend**: React 19+ with React Router
- **Styling**: Bootstrap 5.3 + Custom CSS
- **Build Tool**: Vite 7+
- **State Management**: Context API with localStorage persistence
- **Icons**: Font Awesome 6
- **Performance**: Intersection Observer API, Virtual Scrolling

## 📁 Project Structure

```
app/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Header.jsx       # Navigation and search
│   │   ├── Footer.jsx       # Site footer
│   │   ├── LazyImage.jsx    # Optimized image loading
│   │   ├── CustomerSupport.jsx # Chat widget
│   │   └── ...
│   ├── pages/               # Route components
│   │   ├── Home.jsx         # Landing page
│   │   ├── ProductDetail.jsx # Product details
│   │   ├── PlantScanner.jsx # Plant recognition
│   │   ├── Cart.jsx         # Shopping cart
│   │   └── ...
│   ├── context/             # Global state management
│   │   ├── CartContext.jsx  # Shopping cart state
│   │   ├── WalletContext.jsx # Digital wallet
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   ├── analytics.js     # User tracking
│   │   ├── plantRecognition.js # Plant AI logic
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   ├── data/                # Static data
│   └── App.jsx              # Main app component
├── public/                  # Static assets
├── index.html              # Entry point
└── package.json            # Dependencies
```

## 🛠️ Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/niyati34/The_Flora.git
   cd The_Flora
   ```

2. **Navigate to the app directory**
   ```bash
   cd app
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from app directory**
   ```bash
   cd app
   vercel --prod
   ```

3. **Or connect your GitHub repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Deploy!

### Environment Variables

No environment variables required for basic functionality. All features work with mock data.

## 🧪 Features Overview

### Plant Scanner
The plant recognition system uses a mock AI implementation with a curated plant database. Features include:
- Image upload and analysis
- Plant identification with confidence scores
- Health assessment scoring
- Care recommendations
- Integration with product catalog

### Analytics System
Comprehensive tracking includes:
- Page views and user interactions
- Product views, cart additions, purchases
- Customer support interactions
- Plant scanner usage
- Error tracking and performance metrics

### Customer Support
Interactive chat widget with:
- Keyword-based response system
- Quick question shortcuts
- Typing indicators
- Message history
- Analytics integration

## 🎨 Customization

### Theming
- Edit `src/App.css` for global styles
- Bootstrap variables can be customized
- Font Awesome icons for consistency

### Adding Products
- Update `src/data/products.js`
- Add product images to `public/` directory
- Update plant database in `src/utils/plantRecognition.js`

### Analytics
- Modify `src/utils/analytics.js` for custom tracking
- Currently stores data in localStorage
- Easy to integrate with Google Analytics, Mixpanel, etc.

## 📱 Browser Support

- Chrome 88+
- Firefox 84+
- Safari 14+
- Edge 88+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Known Issues

- Plant recognition uses mock data (replace with real ML service)
- Customer support responses are keyword-based (integrate with real chat service)
- Analytics data stored locally (integrate with analytics service)

## 🔮 Future Enhancements

- [ ] Real AI plant recognition service
- [ ] Payment gateway integration
- [ ] User authentication system
- [ ] Admin dashboard
- [ ] Order tracking
- [ ] Email notifications
- [ ] Advanced search filters
- [ ] Product reviews system
- [ ] Inventory management
- [ ] Multi-language support

## 📞 Support

For support, email support@theflora.com or join our Slack channel.

---

Made with 💚 by [Niyati](https://github.com/niyati34)

**The Flora** is your premier online platform dedicated to gardening and plant enthusiasts. Whether you're a beginner or an expert, we provide a wide range of products and resources to help you grow and maintain the garden of your dreams.

---

## 🌼 Features

- 🌳 **Interactive UI** with a beautiful nature-themed design  
- 📷 **Plant Scanning Feature** to identify plants  
- 🎁 **Free Gifts for Tree Planters** to encourage eco-friendly actions  
- 🎨 **Customization Options** to personalize your gardening experience  

---

## 🛠️ Tech Stack

- HTML  
- CSS  
- Bootstrap  

---

## 🌍 Our Mission

To empower garden lovers by providing the **tools, knowledge, and inspiration** they need to create beautiful, sustainable green spaces.

## screenshots
![flo1](https://github.com/user-attachments/assets/f1e0a137-70fd-42c1-8c90-0f9dba0f83d0)
![flo2](https://github.com/user-attachments/assets/4926e1d0-2859-4b5b-983a-9d3b6cab698d)
![flo3](https://github.com/user-attachments/assets/d3734044-40e4-4b80-b1f7-2d56679fcf22)
![flo4](https://github.com/user-attachments/assets/8f2635e2-3e62-4db0-9843-0826f5e6801b)
![flo5](https://github.com/user-attachments/assets/41f502d5-2554-485f-867f-323280c1c428)
![flo6](https://github.com/user-attachments/assets/cd6784e6-6019-4b93-b80e-29270a49d3c8)
![flo7](https://github.com/user-attachments/assets/f8911297-b7b9-4cef-857a-8e4887969e37)






