window.addEventListener('DOMContentLoaded', fetchData);

document.getElementById('post-form').addEventListener('submit', createPost);

const deletePost = async (postId) => {
	try {
		const response = await fetch(`http://localhost:3004/posts/${postId}`, {
			method: 'DELETE',
		});

		if (!response.ok) {
			throw new Error('Error');
		}

		fetchData();
	} catch (error) {
		console.log('Error', error);
	}
};

async function fetchData() {
	renderLoadingState();
	try {
		const [postsResponse, usersResponse] = await Promise.all([
			fetch('http://localhost:3004/posts'),
			fetch('http://localhost:3004/users'),
		]);

		if (!postsResponse.ok || !usersResponse.ok) {
			throw new Error('Network response was not ok');
		}

		const posts = await postsResponse.json();
		const users = await usersResponse.json();

		const postsWithUserNames = posts.map((post) => {
			const user = users.find((u) => u.id === post.userId);
			return {
				...post,
				userName: user ? user.name : `User: ${post.userId}`,
			};
		});

		renderData(postsWithUserNames);
	} catch (error) {
		renderErrorState();
	}
}

function renderErrorState() {
	const container = document.getElementById('data-container');
	container.innerHTML = '';
	container.innerHTML = '<p>Error</p>';
	console.log('Error');
}

function renderLoadingState() {
	const container = document.getElementById('data-container');
	container.innerHTML = '';
	container.innerHTML = '<p>Loading...</p>';
	console.log('Loading...');
}

function renderData(data) {
	const container = document.getElementById('data-container');
	container.innerHTML = '';

	data.sort((a, b) => b.id - a.id);

	if (data.length > 0) {
		data.forEach((item) => {
			const div = document.createElement('div');
			div.className = 'item';

			div.innerHTML = `
                <h3>${item.title}</h3>
                <h4>${item.userName}</h4>
                <p>${item.body}</p>
                <button data-id="${item.id}">Delete</button>
            `;

			container.insertBefore(div, container.firstChild);
		});

		const deleteButtons = container.querySelectorAll('button[data-id]');
		deleteButtons.forEach((button) => {
			button.addEventListener('click', (event) => {
				const postId = event.target.getAttribute('data-id');
				deletePost(postId);
			});
		});
	}
}

async function createPost(event) {
	event.preventDefault();

	const userId = document.getElementById('user-id').value;
	const title = document.getElementById('title').value;
	const body = document.getElementById('body').value;

	const newPost = {
		userId: parseInt(userId),
		title: title,
		body: body,
	};

	try {
		const response = await fetch('http://localhost:3004/posts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(newPost),
		});

		if (!response.ok) {
			throw new Error('Error');
		}

		// Limpiar
		document.getElementById('post-form').reset();

		fetchData();
	} catch (error) {
		console.log('Error', error);
	}
}
