const songs = [
  { title: 'Astral Voyage', artist: 'Nebula Drift', url: 'music/sample1.mp3', img: 'assets/cover1.jpg' },
  { title: 'Future Pulse', artist: 'CyberFlux', url: 'music/sample2.mp3', img: 'assets/cover2.jpg' },
  { title: 'Starlight Echo', artist: 'Luna Wave', url: 'music/sample3.mp3', img: 'assets/cover3.png' },
  { title: 'Electric Horizon', artist: 'Plus Drift', url: 'music/sample4.mp3', img: 'assets/cover4.jpg' },
  { title: 'Starlight Echo', artist: 'Nova Bloom', url: 'music/sample5.mp3', img: 'assets/cover5.png' },
];

const trendingContainer = document.getElementById('trendingSongs');
const nowPlaying = document.getElementById('nowPlaying');
const searchInput = document.getElementById('searchInput');
const audio = new Audio();
const seekBar = document.getElementById('seekBar');
const volumeBar = document.getElementById('volumeBar');

let currentSongIndex = null;

function createSongCard(song, index) {
  const div = document.createElement('div');
  div.className = 'song-card';
  div.innerHTML = `
    <img src="${song.img}" alt="${song.title}" />
    <div class="info">
      <h4>${song.title}</h4>
      <p>${song.artist}</p>
      <button class="add-btn" onclick="openPlaylistDialog(${index}, event)">➕ Add to Playlist</button>
    </div>`;
  div.onclick = () => playSong(index);
  return div;
}
function renderSongs(list) {
  trendingContainer.innerHTML = '';
  list.forEach((song, idx) => trendingContainer.appendChild(createSongCard(song, idx)));
}

function playSong(index) {
  const song = songs[index];
  if (!song) return;
  currentSongIndex = index;
  audio.src = song.url;
  audio.play();
  nowPlaying.innerText = `🎵 Now Playing: ${song.title} - ${song.artist}`;
}

function togglePlay() {
  audio.paused ? audio.play() : audio.pause();
}

function nextSong() {
  if (currentSongIndex === null) return;
  let next = (currentSongIndex + 1) % songs.length;
  playSong(next);
}
function prevSong() {
  if (currentSongIndex === null) return;
  let prev = (currentSongIndex - 1 + songs.length) % songs.length;
  playSong(prev);
}

audio.addEventListener('timeupdate', () => {
  if (!isNaN(audio.duration)) {
    seekBar.max = audio.duration;
    seekBar.value = audio.currentTime;
  }
});
audio.addEventListener('ended', nextSong);

seekBar.oninput = () => audio.currentTime = seekBar.value;
volumeBar.oninput = () => audio.volume = volumeBar.value;

searchInput.addEventListener('input', () => {
  const q = searchInput.value.toLowerCase();
  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
  );
  renderSongs(filtered);
});

function createPlaylist() {
  const name = prompt("Enter playlist name:");
  if (name) {
    const div = document.createElement('div');
    div.innerText = name;
    div.className = 'playlist';
    document.getElementById('playlists').appendChild(div);
  }
}

window.addEventListener('load', () => {
  renderSongs(songs);
  setTimeout(() => document.getElementById('loader').style.display = 'none', 1000);
});

let playlists = {}; // key: name, value: array of songs
let selectedSongIndex = null;
let selectedPlaylist = null;

function openPlaylistDialog(index, event) {
  event.stopPropagation();
  selectedSongIndex = index;

  const dialog = document.getElementById("playlistDialog");
  const options = document.getElementById("playlistOptions");
  options.innerHTML = '';

  Object.keys(playlists).forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    li.onclick = () => {
      document.querySelectorAll("#playlistOptions li").forEach(el => el.classList.remove("selected"));
      li.classList.add("selected");
      selectedPlaylist = name;
    };
    options.appendChild(li);
  });

  selectedPlaylist = null;
  document.getElementById("newPlaylistName").value = '';
  dialog.classList.remove("hidden");
}

function closeDialog() {
  document.getElementById("playlistDialog").classList.add("hidden");
  selectedSongIndex = null;
  selectedPlaylist = null;
}

function saveToPlaylist() {
  const newName = document.getElementById("newPlaylistName").value.trim();
  const playlistName = newName || selectedPlaylist;

  if (!playlistName || selectedSongIndex === null) return;

  if (!playlists[playlistName]) playlists[playlistName] = [];
  playlists[playlistName].push(songs[selectedSongIndex]);
  updateSidebar();

  closeDialog();
}

function updateSidebar() {
  const container = document.getElementById("playlists");
  container.innerHTML = '';

  Object.entries(playlists).forEach(([name, songList]) => {
    const div = document.createElement('div');
    div.className = 'playlist';
    div.innerHTML = `<strong>${name}</strong>`;
    div.onclick = () => {
      trendingContainer.innerHTML = '';
      songList.forEach(song => {
        const div = document.createElement('div');
        div.className = 'song-card';
        div.innerHTML = `
          <img src="${song.img}" />
          <div class="info"><h4>${song.title}</h4><p>${song.artist}</p></div>`;
        div.onclick = () => {
          audio.src = song.url;
          audio.play();
          nowPlaying.innerText = `🎵 Now Playing: ${song.title} - ${song.artist}`;
        };
        trendingContainer.appendChild(div);
      });
    };
    container.appendChild(div);
  });
}
