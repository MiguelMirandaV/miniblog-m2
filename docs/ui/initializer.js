window.addEventListener('load', () => {
  SwaggerUIBundle({
    url: '/openapi.json',
    dom_id: '#swagger-ui',
    deepLinking: true,
    validatorUrl: null,
    presets: [SwaggerUIBundle.presets.apis],
  });
});
