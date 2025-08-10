import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { getWatchlist, addWatchlist, removeWatchlist } from "../services/watchlist";
import { getQuote as getUsQuote } from "../services/finnhub";
import { getCryptoQuote } from "../services/crypto";
import { getFxPair } from "../services/forex";
import { backend } from "../services/backend";



const marketOptions = [
    {value: 'us', label: 'US Stocks'},
    {value: 'crypto', label: 'Crypto'},
    {value: 'forex', label: 'Forex'},
    {value: 'india', label: 'Indian Stocks'},
];

export default function Watchlist() {
    const token = useAuthStore((s) => s.token);
    const init = useAuthStore((s) => s.init);
    const [items, setItems] = useState([]);
    const [marketType, setMarketType] = useState('us');
    const [symbol, setSymbol] = useState('AAPL');
    const [quotes, setQuotes] = useState({});
    const [msg, setMsg] = useState('');

    useEffect(() =>{init()},[init]);

    async function load() {
        try{
            const data = await getWatchlist();
            setItems(data?.items || []);

        } catch(e) {
            console.error('Error loading watchlist:', e);
            setMsg(e.response?.data?.error || e.message || 'Failed to load watchlist');

        }
    }

    useEffect(() => {
        if (token) load();
    }, [token]);

    async function onAdd(e){
        e?.preventDefault?.();
        try{
            await addWatchlist({marketType, symbol: symbol.trim().toUpperCase()});
            setSymbol('');
            await load();
        }
        catch(e) {
            console.error('Error adding watchlist item:', e);
            setMsg(e.response?.data?.error || e.message || 'Failed to add watchlist item');
        }
    }

    async function onRemove(item) {
        try {
            await removeWatchlist(item);
            await load();
        } catch (e) {
            console.error('Error removing watchlist item:', e);
            setMsg(e.response?.data?.error || e.message || 'Failed to remove watchlist item');
        }
    }

    //fetch quotes for all items periodically
    useEffect(()=>{
        let cancelled = false;
        async function fetchQuotes() {
            const result = {};
            for(const it of items){
                try{
                    if(it.marketType === 'us') {
                        const q = await getUsQuote(it.symbol);
                        result[`${it.marketType}:${it.symbol}`] = q?.c ?? null;
                    } else if(it.marketType === 'crypto') {
                        const q = await getCryptoQuote(it.symbol);
                        result[`${it.marketType}:${it.symbol}`] = q?.price ?? null;
                    } else if(it.marketType === 'forex') {
                        const q = await getFxPair(it.symbol);
                        result[`${it.marketType}:${it.symbol}`] = q?.rate ?? null;
                    } else if (it.marketType === 'india') {
                        const {data} = await backend.get('/api/india/quote', {params: {symbol: it.symbol}});
                        result[`${it.marketType}:${it.symbol}`] = data?.price ?? null;
                    }
                } catch{
                    result[`${it.marketType}:${it.symbol}`] = null;
                }
            }
                if (!cancelled) setQuotes(result);        
            }
            if(items.length) fetchQuotes();
            const t = setInterval(fetchQuotes, 15000);
            return () => {cancelled = true; clearInterval(t)};
        
     }, [items]);

     const list = useMemo (() => items || [] , [items]);

     if(!token) return <div className="container"><div className="card"><div className="card-content">Please Login to manage your watchlist.</div></div></div>
     
     return(
        <div className="container">
            <div className="card">
                <div className="card-header">Watchlist</div>
                <div className="card-content">
                    <form className="controls" onSubmit={onAdd} style={{flexWrap : 'wrap', gap: 8}}>
                        <select className="select" value={marketType} onChange={(e)=> setMarketType(e.target.value)}>
                            {marketOptions.map((o) => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        <input className="input" value={symbol} onChange={(e)=> setSymbol(e.target.value)} placeholder={marketType === 'forex' ? 'Pair e.g. EURUSD': 'Symbol e.g. AAPL/BTC/INFY'}/>
                        <button className="button primary" type="submit">Add</button>
                    </form>
                    {msg && <div style={{color: 'var(--muted)', marginTop:8}}>{msg}</div>}
                    <div className="table-wrap" style={{marginTop :12}}>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Market</th>
                                    <th>Symbol</th>
                                    <th>Last</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.length === 0 && <tr><td colSpan={4}>No items</td></tr>}
                                {list.map((it,idx)=>{
                                    const last = quotes[`${it.marketType}:${it.symbol}`];
                                    return (
                                        <tr key={`${it.marketType} -${it.symbol}-${idx}`}>
                                            <td>{it.marketType}</td>
                                            <td>{it.symbol}</td>
                                            <td>{last !== null ? (typeof last === 'number' ? last.toFixed(4): last): '-'}</td>
                                            <td>
                                                <button className="button ghost" onClick={() => onRemove(it)}>Remove</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
     );
    

};