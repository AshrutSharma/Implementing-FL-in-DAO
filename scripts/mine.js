const { mineBlocks } = require("./helpers");

async function main() {
  console.log(" Fast-forwarding time to bypass the DAO voting delay...");

  // Most test environments set the voting delay to 1 block.
  // We will mine 2 blocks just to be absolutely sure we pass it!
  await mineBlocks(2);

  console.log(
    " Time travel complete! Your proposal should now be Active (State 1).",
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
