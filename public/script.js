            const form = document.querySelector("form");

            async lookup (e)  {
              e.preventDefault();
              form.submitBtn.disabled = true;
              form.output.textContent = "Loading...";
              const resp = await fetch("/api/fortune?args=" + form.args.value);
              const json = await resp.json();
              if (json.error) {
                form.output.textContent = `Error: ${json.error}`;
              } else {
                const { content, sha1 } = json.data;
                form.output.innerHTML = `<pre>${content}
      <a href="/api/fortune/${sha1}">permalink</a></pre>`;
              }
              form.submitBtn.disabled = false;
            };
