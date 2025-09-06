import React from 'react';
import SearchLayout from '@/components/pages/Search/SearchLayout';
import SearchHeader from '@/components/pages/Search/SearchHeader';
import SearchForm from '@/components/pages/Search/SearchForm';
import SearchActiveFilters from '@/components/pages/Search/SearchActiveFilters';
import SearchResults from '@/components/pages/Search/SearchResults';
import SearchEmpty from '@/components/pages/Search/SearchEmpty';
import { useSearchPage } from '@/hooks/pages/useSearchPage';

export default function Index() {
  const {
    query, setQuery,
    k, setK,
    selectedCourse, setSelectedCourse,
    selectedAssignment, setSelectedAssignment,
    selectedModule, setSelectedModule,
    isSearching, hasSearched,
    results,
    courses, assignments, modules, activeFilters,
    onSearch, onClearFilters, onRemoveFilter,
  } = useSearchPage();

  return (
    <SearchLayout>
      <SearchHeader />
      <SearchForm
        query={query}
        k={k}
        selectedCourse={selectedCourse}
        selectedAssignment={selectedAssignment}
        selectedModule={selectedModule}
        courses={courses}
        assignments={assignments}
        modules={modules}
        onChangeQuery={setQuery}
        onChangeK={setK}
        onChangeCourse={setSelectedCourse}
        onChangeAssignment={setSelectedAssignment}
        onChangeModule={setSelectedModule}
        onClearFilters={onClearFilters}
        onSearch={onSearch}
        isSearching={isSearching}
      />
      <SearchActiveFilters activeFilters={activeFilters} onRemove={onRemoveFilter} />
      {hasSearched ? <SearchResults results={results} /> : <SearchEmpty />}
    </SearchLayout>
  );
}

