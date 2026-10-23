import SearchForm from './components/SearchForm';
import ResultsTable from './components/ResultsTable';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="container mt-5">
      <h1 className="mb-4">Поиск запчастей</h1>
      <SearchForm />
      <ResultsTable />
    </div>
  );
}

export default App;
