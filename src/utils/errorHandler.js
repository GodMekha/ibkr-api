const sendError = (res, error, from) => {
  const errorMessage = error.response?.data?.error || error.message;
  const errorStatus = error.response?.status || 500;
  console.error(`Error ໃນ ${from}: [${errorStatus}]`, errorMessage, error.response?.data || '');
  res.status(errorStatus).json({ source: from, error: errorMessage, details: error.response?.data });
};

module.exports = { sendError };

// const handleApiError = (error, endpoint) => {
//   if (error.response) {
//     // The request was made and the server responded with a status code
//     // that falls out of the range of 2xx
//     const status = error.response.status;
//     const message = error.response.data?.error || error.response.data?.message || error.message;
    
//     if (status === 401) {
//       return {
//         status: 401,
//         message: "ຍັງບໍ່ໄດ້ login, ກະລຸນາເປີດ gateway ແລະ login ໃນ browser"
//       };
//     }
    
//     return {
//       status,
//       message: `API Error [${status}]: ${message}`
//     };
//   } else if (error.request) {
//     // The request was made but no response was received
//     return {
//       status: 503,
//       message: "Service unavailable - no response from IBKR Gateway"
//     };
//   } else {
//     // Something happened in setting up the request that triggered an Error
//     return {
//       status: 500,
//       message: `Request setup error: ${error.message}`
//     };
//   }
// };