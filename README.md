# Hands-On: ASL Learning Platform

An interactive American Sign Language learning platform using computer vision and machine learning. Try it live at [https://handson.iverfinne.no](https://handson.iverfinne.no)

## Features

- Real-time hand tracking and gesture recognition
- Interactive ASL alphabet learning
- Progressive difficulty system
- Visual feedback and gesture guides
- Responsive design for various devices
- Dark/light mode support

## Tech Stack

- Next.js 14
- React
- TensorFlow.js
- Handpose model
- Tailwind CSS
- shadcn/ui components
- TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Webcam access

### Installation

```bash
# Clone the repository
git clone https://github.com/lukketsvane/hands-on.git

# Navigate to project directory
cd hands-on

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Project Structure

```
hands-on/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── GestureGame.tsx # Main game component
│   ├── handsigns/      # ASL sign definitions
│   └── ui/             # UI components
├── lib/                 # Utility functions
└── public/             # Static assets
    └── images/         # ASL reference images
```

## Usage

1. Allow camera access when prompted
2. Follow the on-screen instructions to learn ASL letters
3. Hold each sign steady for 2 seconds to progress
4. Toggle video feed visibility with the sun/moon button

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

