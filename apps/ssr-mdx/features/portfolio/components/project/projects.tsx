import {
    Panel,
    PanelHeader,
    PanelTitle,
    PanelTitleSup,
} from '@/features/portfolio/components/panel';
import { CollapsibleList } from '@/components/collapsible-list';
import { PROJECTS } from '../../data/projects';
import { ProjectItem } from './project-item';

export function Projects() {
    return (
        <Panel id="projects">
            <PanelHeader>
                <PanelTitle>
                    Projects
                    <PanelTitleSup>(3)</PanelTitleSup>
                </PanelTitle>
            </PanelHeader>


            <CollapsibleList
                items={PROJECTS}
                max={4}
                renderItem={(item) => <ProjectItem project={item} />}
            />
        </ Panel>
    )
}
