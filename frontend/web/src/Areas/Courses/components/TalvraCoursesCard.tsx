import styled from 'styled-components';
import { TalvraCard, TalvraStack, TalvraText, TalvraButton } from '@ui';

interface TalvraCoursesCardProps {
  name: string;
  instructor: string;
  enrollmentCount: number;
  onViewClick: () => void;
}

const StyledCourseCard = styled(TalvraCard)`
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  transition: all 0.2s ease-in-out;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    transform: translateY(-1px);
  }
`;

const StyledCourseStack = styled(TalvraStack)`
  flex-direction: column;
  gap: 1rem;
`;

const StyledCourseTitle = styled(TalvraText)`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const StyledInstructorText = styled(TalvraText)`
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
`;

const StyledEnrollmentText = styled(TalvraText)`
  font-size: 0.75rem;
  color: #9ca3af;
  margin: 0;
`;

const StyledCourseButton = styled(TalvraButton)`
  background-color: #2563eb;
  color: #ffffff;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out;
  
  &:hover:not(:disabled) {
    background-color: #1d4ed8;
  }
  
  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }
`;

export function TalvraCoursesCard({ name, instructor, enrollmentCount, onViewClick }: TalvraCoursesCardProps) {
  return (
    <StyledCourseCard>
      <StyledCourseStack>
        <StyledCourseTitle as="h3">{name}</StyledCourseTitle>
        <StyledInstructorText>Instructor: {instructor}</StyledInstructorText>
        <StyledEnrollmentText>{enrollmentCount} students enrolled</StyledEnrollmentText>
        <StyledCourseButton onClick={onViewClick}>
          View Course
        </StyledCourseButton>
      </StyledCourseStack>
    </StyledCourseCard>
  );
}

export default TalvraCoursesCard;
