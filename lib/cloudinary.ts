export const getCloudinaryBlurUrl = (url: string): string => {
  if (!url.includes("/upload/")) return url;
  return url.replace("/upload/", "/upload/w_10,e_blur:200,q_1/");
};