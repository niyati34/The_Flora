// Simple compression using JSON optimization
class StorageManager {
  constructor() {
    this.prefix = "flora_";
    this.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  }

  // Compress data by removing unnecessary whitespace and optimizing structure
  compress(data) {
    try {
      // Convert to JSON and remove extra whitespace
      const jsonString = JSON.stringify(data);

      // Simple compression: replace common patterns
      const compressed = jsonString
        .replace(/{"id":/g, '{"i":')
        .replace(/,"name":/g, ',"n":')
        .replace(/,"price":/g, ',"p":')
        .replace(/,"category":/g, ',"c":')
        .replace(/,"image":/g, ',"img":')
        .replace(/,"quantity":/g, ',"q":')
        .replace(/,"timestamp":/g, ',"t":')
        .replace(/,"productId":/g, ',"pid":');

      return compressed;
    } catch (error) {
      console.warn("Compression failed:", error);
      return JSON.stringify(data);
    }
  }

  // Decompress data
  decompress(compressedData) {
    try {
      // Reverse the compression patterns
      const decompressed = compressedData
        .replace(/{"i":/g, '{"id":')
        .replace(/,"n":/g, ',"name":')
        .replace(/,"p":/g, ',"price":')
        .replace(/,"c":/g, ',"category":')
        .replace(/,"img":/g, ',"image":')
        .replace(/,"q":/g, ',"quantity":')
        .replace(/,"t":/g, ',"timestamp":')
        .replace(/,"pid":/g, ',"productId":');

      return JSON.parse(decompressed);
    } catch (error) {
      console.warn("Decompression failed:", error);
      return JSON.parse(compressedData);
    }
  }

  // Set item with compression and expiration
  setItem(key, data, expirationTime = this.maxAge) {
    try {
      const item = {
        data: data,
        timestamp: Date.now(),
        expires: Date.now() + expirationTime,
      };

      const compressed = this.compress(item);
      localStorage.setItem(this.prefix + key, compressed);

      // Track storage usage
      this.trackStorageUsage();

      return true;
    } catch (error) {
      console.error("Storage set failed:", error);
      this.cleanup(); // Try to free space
      return false;
    }
  }

  // Get item with decompression and expiration check
  getItem(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const decompressed = this.decompress(item);

      // Check if expired
      if (decompressed.expires && Date.now() > decompressed.expires) {
        this.removeItem(key);
        return null;
      }

      return decompressed.data;
    } catch (error) {
      console.error("Storage get failed:", error);
      this.removeItem(key); // Remove corrupted data
      return null;
    }
  }

  // Remove item
  removeItem(key) {
    localStorage.removeItem(this.prefix + key);
  }

  // Clear all app data
  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  // Cleanup expired items
  cleanup() {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        const item = localStorage.getItem(key);
        try {
          const decompressed = this.decompress(item);
          if (decompressed.expires && Date.now() > decompressed.expires) {
            localStorage.removeItem(key);
          }
        } catch (error) {
          // Remove corrupted items
          localStorage.removeItem(key);
        }
      }
    });
  }

  // Track storage usage
  trackStorageUsage() {
    let totalSize = 0;
    const keys = Object.keys(localStorage);

    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        totalSize += localStorage.getItem(key).length;
      }
    });

    const sizeInKB = Math.round(totalSize / 1024);

    // Warn if approaching storage limit (assume 5MB limit)
    if (sizeInKB > 4000) {
      console.warn(`Storage usage high: ${sizeInKB}KB`);
      this.cleanup();
    }

    return sizeInKB;
  }

  // Get all stored keys for this app
  getAllKeys() {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.replace(this.prefix, ""));
  }

  // Export data for backup
  exportData() {
    const data = {};
    this.getAllKeys().forEach((key) => {
      data[key] = this.getItem(key);
    });
    return data;
  }

  // Import data from backup
  importData(data) {
    Object.entries(data).forEach(([key, value]) => {
      this.setItem(key, value);
    });
  }
}

// Create singleton instance
const storageManager = new StorageManager();

// Auto cleanup on page load
storageManager.cleanup();

export default storageManager;
