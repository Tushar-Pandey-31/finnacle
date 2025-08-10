import { backend } from './backend';

export async function getWatchlist() {
    const {data} = await backend.get('/api/watchlist');
    return data;
}

export async function addWatchlist({marketType, symbol}) {
    const {data} = await backend.post('/api/watchlist/add', {marketType, symbol});
    return data;
}

export async function removeWatchlist({marketType, symbol}) {
    const {data} = await backend.delete('/api/watchlist/remove', {data: {marketType, symbol}});
    return data;
}
