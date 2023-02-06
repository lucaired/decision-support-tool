def test_project_ordering():
    design_episode_ids = [2,4,2,5,7]
    all_projects_with_design_episode_ids = [
        ('a', [5,7]),
        ('b', [2,4]),
        ('c', [4]),
        ('e', [1,4]),
    ]

    all_matched_projects_by_design_episode_ids = []

    for de_id in design_episode_ids:
        for project_and_de_ids in all_projects_with_design_episode_ids:
            if de_id in  project_and_de_ids[1]:
                if project_and_de_ids[0] not in all_matched_projects_by_design_episode_ids:
                    all_matched_projects_by_design_episode_ids.append(project_and_de_ids[0])

    assert all_matched_projects_by_design_episode_ids == ['b', 'c', 'e', 'a']

    