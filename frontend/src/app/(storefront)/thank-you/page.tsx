export const dynamic = 'force-dynamic';

export default function Page({ searchParams }:{ searchParams?:Record<string,string|undefined> }){
  const id = searchParams?.orderId || '';

  return (
    <main style={{display:'grid',gap:16,padding:16,maxWidth:600,margin:'0 auto',textAlign:'center'}}>
      <h1 style={{fontSize:32,color:'#0070f3',margin:'24px 0 8px 0'}}>Ευχαριστούμε!</h1>
      <p style={{fontSize:18,opacity:.9}}>Η παραγγελία σας καταχωρήθηκε επιτυχώς.</p>
      {id ? (
        <div style={{padding:16,backgroundColor:'#f8f9fa',borderRadius:8,border:'1px solid #e1e4e8'}}>
          <p style={{margin:'0 0 8px 0',opacity:.7,fontSize:14}}>Αριθμός παραγγελίας:</p>
          <p style={{margin:0,fontSize:20,fontWeight:'bold',fontFamily:'monospace',color:'#0070f3'}}>{id}</p>
        </div>
      ) : null}
      <p style={{opacity:.8}}>Θα λάβετε σύντομα email επιβεβαίωσης με τα στοιχεία της παραγγελίας σας.</p>
      <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:16}}>
        <a href="/products" style={{padding:'12px 24px',backgroundColor:'#0070f3',color:'white',textDecoration:'none',borderRadius:6,fontWeight:'bold'}}>
          Συνέχεια στα προϊόντα
        </a>
        <a href="/" style={{padding:'12px 24px',border:'1px solid #ddd',textDecoration:'none',borderRadius:6,color:'#333'}}>
          Αρχική σελίδα
        </a>
      </div>
    </main>
  );
}
