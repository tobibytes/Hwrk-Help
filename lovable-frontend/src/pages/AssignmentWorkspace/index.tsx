import React from 'react';
import { useParams } from 'react-router-dom';
import AssignmentWorkspaceLayout from '@/components/pages/AssignmentWorkspace/AssignmentWorkspaceLayout';
import AssignmentPlanCard from '@/components/pages/AssignmentWorkspace/AssignmentPlanCard';
import AssignmentResourcesCard from '@/components/pages/AssignmentWorkspace/AssignmentResourcesCard';
import AssignmentBriefCard from '@/components/pages/AssignmentWorkspace/AssignmentBriefCard';
import { useAssignmentWorkspacePage } from '@/hooks/pages/useAssignmentWorkspacePage';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function Index() {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const { course, assignment, brief, plan, resources, busyPack, busyBrief, busyPlan, buildStudyPack, extractBrief, generatePlan } = useAssignmentWorkspacePage(courseId || null, assignmentId || null);

  const title = assignment ? `${assignment.name} (${course?.name || courseId})` : 'Assignment';

  return (
    <AssignmentWorkspaceLayout title={title}>
      <Tabs defaultValue="brief">
        <TabsList>
          <TabsTrigger value="brief">Brief</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="brief">
          <AssignmentBriefCard brief={brief} busy={busyBrief} onExtract={extractBrief} />
        </TabsContent>

        <TabsContent value="resources">
          <AssignmentResourcesCard busy={busyPack} resources={resources} onBuild={buildStudyPack} />
        </TabsContent>

        <TabsContent value="plan">
          <AssignmentPlanCard assignmentId={assignmentId!} plan={plan as any} busy={busyPlan} onGenerate={generatePlan} />
        </TabsContent>
      </Tabs>
    </AssignmentWorkspaceLayout>
  );
}
