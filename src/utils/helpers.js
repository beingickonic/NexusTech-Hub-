export const getGreeting = (name) => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Good Morning, ${name} ☀️`;
  if (hour >= 12 && hour < 17) return `Good Afternoon, ${name} 🌤️`;
  if (hour >= 17 && hour <= 23) return `Good Evening, ${name} 🌙`;
  return `Working Late, ${name} 🚀`;
};
