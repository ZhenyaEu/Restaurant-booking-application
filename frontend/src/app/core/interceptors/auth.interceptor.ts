import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Извлекаем токен из localStorage
  const token = localStorage.getItem('token');

  // Если токен есть, клонируем запрос и добавляем заголовок Authorization
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq); // Отправляем измененный запрос дальше
  }

  // Если токена нет, отправляем запрос как есть (например, для Login/Register)
  return next(req);
};
