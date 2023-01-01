import { serve } from "https://deno.land/std@0.140.0/http/server.ts"


serve(async (r) => {
  const pathname = new URL(r.url).pathname
  const b = pathname.startsWith("/assets")
  if (b) {
    const content = await Deno.readTextFile(`.${pathname}`)
    const contentType = pathname.endsWith(".js") ? "application/javascript" : "text/css"
    return new Response(content, {
      headers: {
        "content-type": contentType
      }
    })
  }
  const HTML = await Deno.readTextFile("./index.html")
  return new Response(HTML, {
    headers: {
      "content-type": "text/html"
    }
  })
})