// Netlify function to handle Next.js API routes
export const handler = async (event, context) => {
  // This is a placeholder function
  // The @netlify/plugin-nextjs will handle the actual API routing
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Next.js API handler" }),
  };
};
