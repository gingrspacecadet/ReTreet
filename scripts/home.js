let offset = 0;
const limit = 10;
let loading = false;
let allPostsLoaded = false;

function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (const cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (name === key) {
            return decodeURIComponent(value);
        }
    }
    return null;
}

const accentColor = getCookie("accentcolour") ? `#${getCookie("accentcolour")}` : "#007bff";

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("button").forEach(button => {
        button.style.backgroundColor = accentColor;
    });

    // Load initial posts and attach scroll listener
    loadPosts();
    console.log("Scroll event listener attached!");
	document.addEventListener("scrollend", (event) => {
	    loadPosts();
	});
});

async function loadPosts() {
    if (loading) {
        console.log("Already loading posts, skipping...");
        return;
    }
    if (allPostsLoaded) {
        console.log("All posts are loaded, no more requests.");
        return;
    }
    console.log("Loading new posts...");

    loading = true;
    const loadingIndicator = document.getElementById("loading");
    loadingIndicator.style.display = "block";

    try {
        console.log(`Attempting to fetch: offset=${offset}, limit=${limit}`);
		const response = await fetch(`https://getposts.retreat.workers.dev/?offset=${offset}&limit=${limit}`);
		console.log("Fetch response status:", response.status);

        const data = await response.json();
		console.log("Response data:", data);
		console.log("data.success:", data.success);
		console.log("data.posts:", data.posts);
		console.log("Number of posts:", data.posts ? data.posts.length : "undefined");

        if (response.ok && data.success) {
            if (data.posts.length === 0) {
                allPostsLoaded = true;
                loadingIndicator.innerText = "No more posts.";
                return;
            }

            const postsContainer = document.getElementById("posts");
            data.posts.forEach(post => {
				console.log("Rendering post:", post);
				const formattedContent = post.content.replace(/\n/g, "<br>");
				const newPost = document.createElement("div");
				newPost.className = "post";
				newPost.innerHTML = `
					<p><strong>${post.username}:</strong></p>
					<p>${formattedContent}</p>`;
				document.getElementById("posts").appendChild(newPost);
			});


            offset += limit; // Increment offset for the next batch
        } else {
            throw new Error("Failed to fetch posts.");
        }
    } catch (error) {
        console.error("Error:", error);
        loadingIndicator.innerText = "Failed to load posts.";
    } finally {
		console.log("Resetting loading state...");
		loading = false;
		document.getElementById("loading").style.display = "none";
	}

}
