import { from, fromEvent } from "rxjs";
import { map, filter, switchMap, delay, debounceTime, distinctUntilChanged } from "rxjs/operators";

type SearchResult = any[];

function searchGithubRepo(query: string) {
 return from(
   fetch(`https://api.github.com/search/repositories?q=${query}`)
    .then(response => response.json())
    .then(data => data.items as SearchResult)
 );
}

const source = fromEvent(document.getElementById("query"), "input").pipe(
  map((event: Event) => (event.target as HTMLInputElement).value),
  filter(query => query.length > 3),
  debounceTime(500),
  distinctUntilChanged(),
  switchMap(query => searchGithubRepo(query)),
  map(
    data => data.map(
      (
        {name, stargazers_count, html_url, description}) => 
        { return { name, stargazers_count, html_url, description };
   }))
);

source.subscribe(repos => {
  const resultElement = document.getElementById("results");
  resultElement.innerHTML = repos.map(repo => {
    return `
    <p>
      <a href="${repo.html_url}">${repo.name} (${repo.stargazers_count})</a>
    </p>
    `;
  }).join('');
});
