// functions/_middleware.ts
import * as Sentry from "@sentry/cloudflare";

export const onRequest = Sentry.sentryPagesPlugin({
  dsn: "https://1ead16d7169e848b1dad3dca6eb00cae@o4511535655026688.ingest.us.sentry.io/4511535695986688",
  tracesSampleRate: 1.0,
  debug: true,
});
