import fs from 'fs/promises';
import { JSDOM } from 'jsdom';

class HTMLToRSSConverter {
  constructor() {
    this.rssItems = [];
  }

  async readHTMLFile(filePath) {
    try {
      const htmlContent = await fs.readFile(filePath, 'utf8');
      return htmlContent;
    } catch (error) {
      throw new Error(`Failed to read HTML file: ${error.message}`);
    }
  }

  parseHTML(htmlContent) {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    
    // Find all news sections
    const newsSections = document.querySelectorAll('.news-section');
    
    newsSections.forEach(section => {
      const titleElement = section.querySelector('h3.title');
      const subtitleElement = section.querySelector('p.subtitle');
      
      if (titleElement && subtitleElement) {
        const title = titleElement.textContent.trim();
        const subtitleText = subtitleElement.textContent.trim();
        
        // Extract date and author from subtitle
        const { date, author } = this.parseSubtitle(subtitleText);
        
        this.rssItems.push({
          title,
          date,
          author,
          originalSubtitle: subtitleText
        });
      }
    });
  }

  parseSubtitle(subtitle) {
    // Parse format: "July 21, 2025 - by Defender"
    const parts = subtitle.split('-');
    
    if (parts.length >= 2) {
      const dateStr = parts[0].trim();
      const authorPart = parts[1].trim();
      // Remove "by " prefix if it exists
      const author = authorPart.replace(/^by\s+/i, '');
      const formattedDate = this.formatDate(dateStr);
      
      return { date: formattedDate, author };
    }
    
    // Fallback if format doesn't match
    return { date: new Date().toISOString(), author: 'Unknown' };
  }

  formatDate(dateStr) {
    try {
      // Parse date like "July 21, 2025"
      const date = new Date(dateStr);
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      
      // Return ISO 8601 format for RSS
      return date.toISOString();
    } catch (error) {
      console.warn(`Could not parse date "${dateStr}", using current date`);
      return new Date().toISOString();
    }
  }

  generateRSS() {
    const now = new Date().toISOString();
    
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>ORI Newsletter Feed</title>
    <description>RSS feed generated from ORI newsletter HTML</description>
    <link>https://openresearchinstitute.org/news.html</link>
    <image>
      <url>https://openresearchinstitute.org/assets/gradient-circle.png</url>
      <title>ORI Newsletter Feed</title>
      <link>https://openresearchinstitute.org</link>
      <width>144</width>
      <height>144</height>
    </image>
    <lastBuildDate>${now}</lastBuildDate>
    <pubDate>${now}</pubDate>
    <language>en-us</language>
`;

    this.rssItems.forEach(item => {
      rss += `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.originalSubtitle}]]></description>
      <pubDate>${item.date}</pubDate>
      <author><![CDATA[${item.author}]]></author>
      <guid isPermaLink="false">${this.generateGUID(item)}</guid>
    </item>`;
    });

    rss += `
  </channel>
</rss>`;

    return rss;
  }

  generateGUID(item) {
    // Generate a simple GUID based on title and date
    const str = `${item.title}-${item.date}`;
    return Buffer.from(str).toString('base64').replace(/[^a-zA-Z0-9]/g, '');
  }

  async writeRSSFile(rssContent, outputPath = 'newsletter.rss') {
    try {
      await fs.writeFile(outputPath, rssContent, 'utf8');
      console.log(`RSS feed written to: ${outputPath}`);
    } catch (error) {
      throw new Error(`Failed to write RSS file: ${error.message}`);
    }
  }

  async convert(inputPath, outputPath = 'newsletter.rss') {
    try {
      console.log(`Reading HTML file: ${inputPath}`);
      const htmlContent = await this.readHTMLFile(inputPath);
      
      console.log('Parsing HTML content...');
      this.parseHTML(htmlContent);
      
      console.log(`Found ${this.rssItems.length} news items`);
      
      if (this.rssItems.length === 0) {
        console.warn('No news items found in the HTML file');
        return;
      }
      
      console.log('Generating RSS feed...');
      const rssContent = this.generateRSS();
      
      console.log(`Writing RSS feed to: ${outputPath}`);
      await this.writeRSSFile(rssContent, outputPath);
      
      console.log('Conversion completed successfully!');
      
      // Display found items
      console.log('\nFound items:');
      this.rssItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   Date: ${new Date(item.date).toLocaleDateString()}`);
        console.log(`   Author: ${item.author}\n`);
      });
      
    } catch (error) {
      console.error('Error during conversion:', error.message);
      process.exit(1);
    }
  }
}

// Usage
async function main() {
  const converter = new HTMLToRSSConverter();
  
  const inputFile = process.argv[2] || 'news.html';
  const outputFile = process.argv[3] || 'news.rss';
  
  await converter.convert(inputFile, outputFile);
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default HTMLToRSSConverter;