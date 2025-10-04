# 🐍 Python Tutor - AI-Powered Interactive Learning

An AI-powered Python learning platform that runs entirely in your browser. Get personalized lessons, instant code execution, and 24/7 AI tutoring powered by Anthropic's Claude.

## ✨ Features

- **🤖 AI-Powered Tutor**: Personalized learning with Claude AI
- **⚡ Browser-Based Python**: Run Python code instantly with Pyodide (no installation)
- **🎯 Interactive Code Editor**: Monaco Editor with syntax highlighting
- **💬 Live Chat Support**: Ask questions and get instant AI feedback
- **📊 Progress Tracking**: Your learning journey saved locally
- **🔒 Privacy-First**: Your API key and data stay in your browser
- **📱 Responsive Design**: Works on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open in browser**
   ```
   http://localhost:3000
   ```

4. **Configure API Key**
   - Click on the API key setup section
   - Paste your Anthropic API key (starts with `sk-ant-`)
   - Your key is stored securely in browser localStorage

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Python Runtime**: Pyodide (WebAssembly)
- **Code Editor**: Monaco Editor
- **AI**: Anthropic Claude API (user's own key)
- **Storage**: Browser localStorage
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
python-tutor/
├── app/
│   ├── layout.tsx          # Root layout with AppProvider
│   ├── page.tsx            # Main dashboard
│   └── globals.css         # Global styles
├── components/
│   └── features/
│       ├── api-key/        # API key management UI
│       ├── code-editor/    # Monaco-based code editor
│       └── lesson/         # AI tutor chat interface
├── contexts/
│   └── AppContext.tsx      # Global state management
├── lib/
│   ├── llm/
│   │   └── anthropic.ts    # Claude API integration
│   ├── python/
│   │   └── pyodide.ts      # Python execution engine
│   └── storage/
│       └── localStorage.ts # Browser storage service
└── types/
    └── index.ts            # TypeScript definitions
```

## 🎓 How to Use

### 1. Set Up Your API Key
- Visit [Anthropic Console](https://console.anthropic.com/)
- Create or copy your API key
- Paste it in the API Key Setup section

### 2. Start Learning
- **Code Editor**: Write Python code in the left panel
- **AI Tutor**: Chat with Claude in the right panel
- Click "Run Code" to execute your Python programs
- Ask the AI tutor for help, explanations, or exercises

### 3. Example Interactions

**Request a lesson:**
```
"Teach me about Python lists with examples"
```

**Get an exercise:**
```
"Create a beginner exercise about for loops"
```

**Debug code:**
```
"Why is my code giving an IndexError?"
```

**Request a project:**
```
"Help me build a simple calculator"
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your repository
   - Deploy (zero configuration needed)

### Other Platforms

The app is a static Next.js site and can be deployed to:
- Netlify
- Cloudflare Pages
- GitHub Pages (with static export)

## 💡 Tips

- **API Costs**: You pay only for what you use with your Anthropic API key
- **Privacy**: All data stays in your browser, nothing is sent to our servers
- **Performance**: First load may take a few seconds as Pyodide downloads (~6MB)
- **Browser Support**: Works best in Chrome, Firefox, Safari (latest versions)

## 🐛 Troubleshooting

**Pyodide not loading?**
- Check browser console for errors
- Try clearing cache and reloading
- Ensure stable internet connection

**API key not working?**
- Verify key starts with `sk-ant-`
- Check API key is active in Anthropic Console
- Look for error messages in AI Tutor chat

**Code not executing?**
- Wait for "Python Ready" indicator
- Check for syntax errors in your code
- Review output panel for error messages

---

**Built with ❤️ for Python learners everywhere**
