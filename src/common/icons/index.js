const req = require.context('./svg', false, /\.svg$/);
const requireAll = requireContext => {
  requireContext.keys().map(requireContext);
};
requireAll(req);
export const iconList = req.keys().map(item => item.substring(2, item.length - 4));
