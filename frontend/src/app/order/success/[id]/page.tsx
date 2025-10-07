export default function Page({ params }:{ params:{ id:string } }){
  return (
    <main>
      <h1>Ευχαριστούμε!</h1>
      <p>Η παραγγελία σας καταχωρήθηκε με αριθμό <strong>#{params.id}</strong>.</p>
      <p><a href="/products">Συνέχεια στις αγορές</a></p>
    </main>
  );
}
