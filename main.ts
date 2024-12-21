const folder = Deno.args[0];

if (!folder) {
  console.error("Please provide a folder to run.");
  Deno.exit(1);
}

const command = new Deno.Command("sh", {
  args: ["-c", `cd ${folder} && deno run --allow-read main.ts`],
});

const { code } = await command.spawn().status;

Deno.exit(code);
