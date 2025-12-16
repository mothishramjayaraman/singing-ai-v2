# SingSmart AI Design Guidelines

## Design Approach
**System Selected**: Material Design with Learning Platform Patterns (Duolingo, Khan Academy)
**Rationale**: Educational platform requiring clear information hierarchy, progress visualization, and encouraging user feedback. Utility and learnability are paramount for beginner singers.

## Typography System
- **Primary Font**: Inter or Roboto (Google Fonts)
- **Heading Hierarchy**: 
  - H1: 2.5rem/3rem, font-bold (Dashboard title, Phase headers)
  - H2: 1.875rem/2.25rem, font-semibold (Section titles)
  - H3: 1.5rem, font-semibold (Exercise titles, Card headers)
  - H4: 1.25rem, font-medium (Subsections)
- **Body Text**: 1rem base, font-normal (Instructions, descriptions)
- **Small Text**: 0.875rem (Metadata, timestamps, helper text)
- **Micro Text**: 0.75rem (Labels, badges)

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16
- Tight spacing: p-2, gap-2 (within components)
- Standard spacing: p-4, gap-4 (component padding)
- Section spacing: p-6, p-8 (card containers)
- Page spacing: p-12, p-16 (main containers)

**Grid Structure**:
- Dashboard: 12-column grid with sidebar (3 cols) + main content (9 cols)
- Responsive breakpoints: mobile (stack), tablet (2-col), desktop (3-col for cards)

## Core Component Library

### Navigation
**Top Navigation Bar**:
- Fixed header with app logo/name (left), user profile/settings (right)
- Height: h-16, shadow-sm
- Phase indicator chips showing locked/unlocked status

**Sidebar Navigation** (Desktop):
- Width: w-64, fixed left panel
- Phase sections with expand/collapse
- Current phase highlighted with subtle background
- Progress indicators (circular progress rings) next to each phase

### Dashboard Layout
**Main Dashboard Structure**:
- Hero section (h-48): Welcome message, current streak, weekly goal progress
- 3-column grid below: Today's Exercises, Recent Scores, Upcoming Milestones
- Each card: rounded-lg, shadow-md, p-6

**Progress Visualization**:
- Circular progress rings for phase completion (stroke-width: 8)
- Horizontal progress bars for individual exercises (h-2, rounded-full)
- Score meters: vertical bars with gradient fills showing pitch/tone/breathing scores
- Weekly calendar heatmap for practice consistency

### Phase Cards
**Phase Overview Cards**:
- Large card format: min-h-64, rounded-xl, p-8
- Lock icon overlay for locked phases (text-6xl, opacity-50)
- Unlocked phases show: completion percentage, current exercise count, estimated time
- Phase number badge (absolute top-right, rounded-full, w-12 h-12)

### Recording Interface
**Audio Control Panel**:
- Centered recording button (w-20 h-20, rounded-full, pulsing animation when recording)
- Waveform visualization above (h-32, responsive width)
- Timer display (text-2xl, monospace font)
- Playback controls below: play/pause, restart, delete (each w-12 h-12)
- Volume level meter (vertical, h-40, w-4)

### Exercise Components
**Exercise Cards**:
- Standard card: p-6, rounded-lg, border-l-4 (accent border)
- Header: exercise name + difficulty badge
- Body: instructions (max-w-prose)
- Footer: Start button + estimated duration
- Completed exercises: checkmark icon, reduced opacity

**Feedback Display**:
- Score breakdown: 3-column grid showing Pitch, Tone, Breathing
- Each metric: large number (text-4xl), label below, circular progress indicator
- Improvement suggestions: bullet list with icon bullets
- Overall rating: star display (1-5 stars, text-3xl)

### Performance Simulator
**Virtual Stage View**:
- Full-width container (min-h-screen minus header)
- Stage illustration or gradient background
- Centered performance area with microphone icon
- Audience reaction display: emoji grid or text feedback (bottom third)
- Performance score overlay (top-right corner)

### Forms & Inputs
**Onboarding Form**:
- Single-column layout (max-w-lg, mx-auto)
- Input fields: h-12, rounded-md, border-2
- Radio buttons for experience level (flex row, gap-4)
- Vocal range slider with visual keyboard representation
- Large submit button (w-full, h-12, rounded-lg)

**Practice Routine Builder**:
- Drag-and-drop exercise cards (visual grab cursor)
- Time slots displayed as horizontal timeline
- Weekly calendar selector (7-day grid)

### Data Visualization
**Charts & Graphs**:
- Line charts for progress over time (responsive, h-64)
- Bar charts for exercise completion (h-48)
- Radar/spider chart for vocal skill breakdown
- All charts with grid lines, axis labels, clear legends

### Badges & Achievements
**Accomplishment Display**:
- Icon-first badges (w-16 h-16, rounded-full background)
- Achievement name below (text-sm, font-medium)
- Grid layout: grid-cols-3 md:grid-cols-4 lg:grid-cols-6
- Locked achievements: grayscale with lock overlay

## Interaction Patterns
- **Buttons**: Primary (filled), Secondary (outlined), Ghost (text-only)
- **Button sizes**: Small (h-8, px-3), Medium (h-10, px-4), Large (h-12, px-6)
- **Loading states**: Spinner icon (animate-spin) or skeleton screens
- **Empty states**: Icon + helpful message + CTA button (centered, max-w-md)
- **Tooltips**: Small popovers on hover for additional context (text-sm, p-2, rounded)

## Responsive Behavior
- **Mobile** (<768px): Single column, collapsible sidebar drawer, stacked cards
- **Tablet** (768-1024px): 2-column grid, persistent sidebar
- **Desktop** (>1024px): 3-column grid, full sidebar, expanded visualizations

## Accessibility
- Focus states: ring-2 ring-offset-2 on all interactive elements
- ARIA labels on all icons and controls
- Keyboard navigation for all recording/playback functions
- High contrast ratios for all text (maintain readability)
- Screen reader announcements for score updates

## Images
**Hero Section Images**: NOT NEEDED - This is a dashboard application, not a marketing site
**Illustrations**: Use simple, encouraging illustrations for:
- Empty state placeholders (no exercises completed yet)
- Achievement badges (microphone, musical notes, stars)
- Phase completion celebrations (confetti, trophy icons)
- Virtual stage background (subtle stage/curtain illustration)

All illustrations should be lightweight SVGs from libraries like unDraw or Humaaans, conveying encouragement and progress without distraction.