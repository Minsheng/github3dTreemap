#!/bin/bash

# find out the top 10 languages with projects that have over 5000 stars
# find out the top 10 projects by star counts in each languages, with 
# {id, name, html_url, owner.type, stargazers_count, forks_count, #of contributors, # of total commits, children:[contributors]}
# for each contributor in the children, {"name":..., "commits":..., size":1}

output_path=./data
ext=".json"
# find by star > 5000 in all repos
declare -a languages=(
	'javascript'
	'objective-c'
	'ruby'
	'java'
	'python'
	'html'
	'css'
	'go'
	'php'
	'c%2B%2B'
	)

test_arr=('javascript' 'ruby')

# find contributors of javascript project, jquery
# curl -G "https://api.github.com/repositories/167174/stats/contributors"      \
#     -H "Accept: application/vnd.github.preview"         \
#     | jq -s '.[] | { user:.author.login, user_url:.author.html_url, commits:.total }' \
#     > test.json

# find top 10 javascript projects
for i in ${test_arr[@]}
do
	file=$output_path/${i}$ext
	touch $file
	curl -G "https://api.github.com/search/repositories?q=language:${i}+stars:>5000&sort=stars&order=desc" -H "Accept: application/vnd.github.preview" | jq -s '.[].items[:10] | .[] | {id, name, user_name:(.owner.login), user_type:(.owner.type), html_url, stargazers_count, forks_count}' > $file
done
exit 0


# curl -G "https://api.github.com/search/repositories?q=language:javascript+stars:>5000&sort=stars&order=desc" -H "Accept: application/vnd.github.preview" | jq -s '.[].items[:10] | .[] | {id, name, user_name:(.owner.login), user_type:(.owner.type), html_url, stargazers_count, forks_count}' > test.json