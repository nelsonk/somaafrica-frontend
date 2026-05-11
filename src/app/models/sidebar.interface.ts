export interface SidebarLink {
  id: string;
  label: string;
  icon?: string;
  dataToggle: string;
  href: string;
  controls: string;
  subItems: string[];
  subItemsHref: string[];
}

export const SIDEBAR_LINKS: SidebarLink[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'bi bi-speedometer2', // Speedometer for dashboard overview
    dataToggle: 'collapse',
    href: '/profile',
    controls: 'dashboardlist',
    subItems: ['All', 'Performance', 'Payments'],
    subItemsHref: ['/profile', '#', '#'],
  },
  {
    id: 'student',
    label: 'Students',
    icon: 'bi bi-mortarboard', // Graduation cap for students
    dataToggle: 'collapse',
    href: '/profile/student',
    controls: 'studentlist',
    subItems: ['All', 'Performance', 'Payments'],
    subItemsHref: ['/profile/student', '#', '#'],
  },
  {
    id: 'school',
    label: 'Schools',
    icon: 'bi bi-building', // Building icon for schools
    dataToggle: 'collapse',
    href: '/profile/school',
    controls: 'schoollist',
    subItems: ['All', 'Performance', 'Payments'],
    subItemsHref: ['/profile/school', '#', '#'],
  },
  {
    id: 'teacher',
    label: 'Teachers',
    icon: 'bi bi-person-badge', // Person badge for teachers
    dataToggle: 'collapse',
    href: '/profile/teacher',
    controls: 'teacherlist',
    subItems: ['All', 'Performance', 'Payments'],
    subItemsHref: ['/profile/teacher', '#', '#'],
  },
  {
    id: 'agent',
    label: 'SomaAfrica Agents',
    icon: 'bi bi-people', // Group of people for agents
    dataToggle: 'collapse',
    href: '/profile/agent',
    controls: 'agentlist',
    subItems: ['All', 'Performance', 'Payments'],
    subItemsHref: ['/profile/agent', '#', '#'],
  },
  {
    id: 'admin',
    label: 'SomaAfrica Admins',
    icon: 'bi bi-shield-lock', // Shield lock for admin access
    dataToggle: 'collapse',
    href: '/profile/admin',
    controls: 'adminlist',
    subItems: ['All', 'Performance', 'Payments'],
    subItemsHref: ['/profile/admin', '#', '#'],
  },
];
