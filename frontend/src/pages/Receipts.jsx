import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Receipts() {
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [receipts, setReceipts] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    partner_name: '',
    schedule_date: new Date().toISOString().split('T')[0],
    lines: [] 
  });

  useEffect(() => {
    fetchReceipts();
    api.get('/products').then(res => setProducts(res.data));
  }, []);

  const fetchReceipts = () => {
    api.get('/operations/receipt').then(res => setReceipts(res.data));
  };

  // --- ACTIONS ---
  const handleNewClick = () => {
    setCurrentReceipt(null);
    setFormData({ partner_name: '', schedule_date: '', lines: [{ product_id: '', qty: 1 }] });
    setView('form');
  };

  const handleRowClick = (id) => {
    api.get(`/operations/details/${id}`).then(res => {
      setCurrentReceipt(res.data);
      setView('form');
    });
  };

  const addLine = () => {
    setFormData({ ...formData, lines: [...formData.lines, { product_id: '', qty: 1 }] });
  };

  const updateLine = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] = value;
    setFormData({ ...formData, lines: newLines });
  };

  // 1. SAVE (Draft)
  const handleSave = async () => {
    const payload = {
      type: 'receipt',
      partner_name: formData.partner_name,
      schedule_date: new Date(formData.schedule_date).toISOString(),
      moves: formData.lines.map(l => ({ product_id: parseInt(l.product_id), qty: parseFloat(l.qty) }))
    };
    const res = await api.post('/operations/create', payload);
    handleRowClick(res.data.id); 
  };

  // 2. MARK AS TODO (Ready)
  const handleMarkTodo = async () => {
    if(!currentReceipt) return;
    await api.put(`/operations/${currentReceipt.id}/mark_todo`);
    handleRowClick(currentReceipt.id);
  };

  // 3. VALIDATE (Done)
  const handleValidate = async () => {
    if(!currentReceipt) return;
    await api.put(`/operations/${currentReceipt.id}/validate`);
    handleRowClick(currentReceipt.id);
  };

  const filteredReceipts = receipts.filter(r => 
    r.reference.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.partner_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- STYLES ---
  const styles = `
    .receipt-container { padding: 20px; font-family: sans-serif; }
    .top-actions { display: flex; justify-content: space-between; margin-bottom: 15px; }
    .btn-new { background: #714B67; color: white; border: none; padding: 8px 20px; border-radius: 4px; font-weight: bold; cursor: pointer; }
    .search-box { padding: 8px; border: 1px solid #ccc; border-radius: 4px; width: 250px; }
    .list-table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
    .list-table th { text-align: left; padding: 12px; background: #f8f9fa; border-bottom: 2px solid #eee; color: #666; font-size: 13px; }
    .list-table td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; cursor: pointer; }
    .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .st-draft { background: #e2e3e5; color: #383d41; }
    .st-ready { background: #cce5ff; color: #004085; }
    .st-done { background: #d4edda; color: #155724; }
    .form-header-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 15px; margin-bottom: 20px; }
    .pipeline { display: flex; background: white; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
    .pipe-step { padding: 8px 20px; font-size: 13px; font-weight: 600; color: #666; border-right: 1px solid #ddd; background: #f8f9fa; }
    .pipe-step.active { background: #714B67; color: white; }
    .action-buttons { display: flex; gap: 10px; margin-bottom: 20px; }
    .btn-action { padding: 8px 16px; border: 1px solid #714B67; background: white; color: #714B67; border-radius: 4px; cursor: pointer; font-weight: 600; }
    .btn-primary { background: #714B67; color: white; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; background: white; padding: 20px; border: 1px solid #eee; border-radius: 4px; margin-bottom: 20px; }
    .field-group label { display: block; font-size: 13px; font-weight: bold; color: #333; margin-bottom: 5px; }
    .field-group input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; background: #fcfcfc; }
    .products-table { width: 100%; border: 1px solid #eee; }
    .products-table th { background: #f8f9fa; padding: 10px; text-align: left; font-size: 13px; }
    .products-table td { padding: 10px; border-top: 1px solid #eee; }
  `;

  return (
    <div className="receipt-container">
      <style>{styles}</style>

      {view === 'list' && (
        <>
          <div className="top-actions">
            <button className="btn-new" onClick={handleNewClick}>NEW</button>
            <div style={{fontSize:'20px', fontWeight:'bold', color:'#333'}}>Receipts</div>
            <input className="search-box" placeholder="Search Reference..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <table className="list-table">
            <thead><tr><th>Reference</th><th>From</th><th>To</th><th>Contact</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
                {filteredReceipts.map(r => (
                    <tr key={r.id} onClick={() => handleRowClick(r.id)}>
                        <td style={{fontWeight:'bold', color:'#714B67'}}>{r.reference}</td>
                        <td>Vendor</td><td>Stock</td><td>{r.partner_name}</td>
                        <td>{new Date(r.schedule_date).toLocaleDateString()}</td>
                        <td><span className={`status-badge st-${r.status}`}>{r.status}</span></td>
                    </tr>
                ))}
            </tbody>
          </table>
        </>
      )}

      {view === 'form' && (
        <>
          <div className="form-header-bar">
            <div style={{fontSize:'18px', color:'#714B67', fontWeight:'bold'}}>
                <span style={{color:'#999', cursor:'pointer'}} onClick={() => setView('list')}>Receipts / </span>
                {currentReceipt ? currentReceipt.reference : "New"}
            </div>
            <div className="pipeline">
                {['draft', 'ready', 'done'].map(s => (
                    <div key={s} className={`pipe-step ${currentReceipt?.status === s ? 'active' : ''}`}>{s.toUpperCase()}</div>
                ))}
            </div>
          </div>

          <div className="action-buttons">
            {!currentReceipt && <button className="btn-action btn-primary" onClick={handleSave}>Save Draft</button>}
            {currentReceipt?.status === 'draft' && <button className="btn-action btn-primary" onClick={handleMarkTodo}>Mark as Todo</button>}
            {currentReceipt?.status === 'ready' && <button className="btn-action btn-primary" onClick={handleValidate}>Validate</button>}
            <button className="btn-action" onClick={() => setView('list')}>Cancel</button>
            {currentReceipt?.status === 'done' && <button className="btn-action" onClick={() => window.print()}>Print</button>}
          </div>

          <div className="form-grid">
            <div className="field-group">
                <label>Receive From</label>
                <input value={currentReceipt ? currentReceipt.partner_name : formData.partner_name} onChange={e => setFormData({...formData, partner_name: e.target.value})} disabled={!!currentReceipt} placeholder="e.g. Vendor Name" />
            </div>
            <div className="field-group">
                <label>Schedule Date</label>
                <input type="date" value={currentReceipt ? currentReceipt.schedule_date?.split('T')[0] : formData.schedule_date} onChange={e => setFormData({...formData, schedule_date: e.target.value})} disabled={!!currentReceipt} />
            </div>
          </div>

          <h3 style={{fontSize:'15px', borderBottom:'2px solid #714B67', display:'inline-block', marginBottom:'10px'}}>Products</h3>
          <table className="products-table">
            <thead><tr><th>Product</th><th>Quantity</th></tr></thead>
            <tbody>
                {currentReceipt ? currentReceipt.moves.map(m => (
                    <tr key={m.id}><td>{m.product_name}</td><td>{m.qty}</td></tr>
                )) : formData.lines.map((line, i) => (
                    <tr key={i}>
                        <td>
                            <select style={{width:'100%', padding:'5px'}} onChange={e => updateLine(i, 'product_id', e.target.value)}>
                                <option value="">Select Product...</option>
                                {products.map(p => <option key={p.id} value={p.id}>[{p.sku}] {p.name}</option>)}
                            </select>
                        </td>
                        <td><input type="number" value={line.qty} style={{width:'100px', padding:'5px'}} onChange={e => updateLine(i, 'qty', e.target.value)} /></td>
                    </tr>
                ))}
            </tbody>
          </table>
          {!currentReceipt && <div style={{marginTop:'10px'}}><span style={{color:'#017E84', cursor:'pointer', fontWeight:'bold'}} onClick={addLine}>Add a line</span></div>}
        </>
      )}
    </div>
  );
}