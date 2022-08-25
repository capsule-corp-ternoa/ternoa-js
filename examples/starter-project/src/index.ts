
import { initializeApi, safeDisconnect } from "ternoa-js"

async function main() {
  // This will initialize the internal SDK API.
  //
  // It's not strictly necessary but it's good practice to initialize the API as soon as possible.
  // If this call is omitted then the first SDK call will return an exception.
  // You can also specify the endpoint by passing the endpoint address as the first argument.
  console.log("Connecting...");
  await initializeApi();

  console.log("Disconnecting...");
  await safeDisconnect();

  console.log("Done :)");
  process.exit()
}

main()
