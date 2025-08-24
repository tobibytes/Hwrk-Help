import styled from 'styled-components';
import { TalvraCard, TalvraStack, TalvraText, TalvraButton } from '@ui';

interface TalvraAdminCardProps {
  title: string;
  description: string;
  userCount?: number;
  onManageClick: () => void;
}

const StyledAdminCard = styled(TalvraCard)`
  background-color: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  transition: all 0.2s ease-in-out;
  
  &:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  }
`;

const StyledAdminStack = styled(TalvraStack)`
  flex-direction: column;
  gap: 1.25rem;
`;

const StyledAdminTitle = styled(TalvraText)`
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
`;

const StyledAdminDescription = styled(TalvraText)`
  font-size: 1rem;
  color: #475569;
  line-height: 1.5;
  margin: 0;
`;

const StyledUserCount = styled(TalvraText)`
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
  margin: 0;
`;

const StyledAdminButton = styled(TalvraButton)`
  background-color: #059669;
  color: #ffffff;
  padding: 0.875rem 1.25rem;
  border-radius: 0.375rem;
  font-weight: 600;
  font-size: 0.875rem;
  transition: background-color 0.2s ease-in-out;
  align-self: flex-start;
  
  &:hover:not(:disabled) {
    background-color: #047857;
  }
  
  &:focus-visible {
    outline: 2px solid #059669;
    outline-offset: 2px;
  }
`;

export function TalvraAdminCard({ title, description, userCount, onManageClick }: TalvraAdminCardProps) {
  return (
    <StyledAdminCard>
      <StyledAdminStack>
        <StyledAdminTitle as="h3">{title}</StyledAdminTitle>
        <StyledAdminDescription>{description}</StyledAdminDescription>
        {userCount && (
          <StyledUserCount>{userCount} users</StyledUserCount>
        )}
        <StyledAdminButton onClick={onManageClick}>
          Manage
        </StyledAdminButton>
      </StyledAdminStack>
    </StyledAdminCard>
  );
}

export default TalvraAdminCard;
