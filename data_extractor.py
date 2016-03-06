import urllib2
import json

# find out the top 10 languages with projects that have over 5000 stars
# find out the top n projects by star counts in each languages, with 
# {id, name, html_url, owner.type, stargazers_count, forks_count, #of contributors, # of total commits, children:[contributors]}
# for each contributor in the children, {"name":..., "commits":..., size":1}

LANGUAGES = ['javascript', 'objective-c', 'ruby', 'java', 'python', 'html', 'css', 'go', 'php', 'c%2B%2B']
TEST = ['javascript', 'ruby']
LIMIT = 10
PROJECT_LIMIT = 6
MASTER_LIST = {'name':'Top 10 Languages', 'children':[]}
SEARCH_REPO_URL = 'https://api.github.com/search/repositories'
CONTRIBUTOR_URL = 'https://api.github.com/repositories/'
CONTRIBUTOR_POSTFIX = '/stats/contributors'
STAR_LIMIT = 5000
TOKEN = 'token e553789597130ee9b9e1fc19f7a93797ca0e7b63'

# helper for fetching data from github server
def fetchDataFromUrl(url, query=''):
	if query != '':
		req = urllib2.Request(url+'?q='+query, headers={"Authorization" : TOKEN})
	else:
		req = urllib2.Request(url, headers={"Authorization" : TOKEN})
	
	opener = urllib2.build_opener()
	f = opener.open(req)
	data = json.loads(f.read())
	return data

def genContributorUrl(url, repo_id, postfix):
	return url+str(repo_id)+postfix

'''
the script below will 
1. iterate through the data returned from github
2. format the data
3. fill the master list
4. output to a json file
'''

for lang in LANGUAGES:
	star = STAR_LIMIT # default limit for other languages is 5000
	
	if lang == 'javascript':
		star = 20000 # reduce the number of records to be fetched since javascript is popular
	
	q = 'language:'+str(lang)+'+stars:>'+str(star)+'&sort=stars&order=desc'

	lang_data = fetchDataFromUrl(SEARCH_REPO_URL, q) # return a list of projects

	project_list = {} # to be added in master list
	project_list['name'] = lang
	project_list['children'] = []
	
	for i in range(PROJECT_LIMIT): # the top number of projects in each language
		proj_items = lang_data['items']
		proj_item = {}
		proj_item['repo_id'] = proj_items[i]['id']
		proj_item['name'] = proj_items[i]['name'] # project name
		proj_item['owner_name'] = proj_items[i]['owner']['login']
		proj_item['owner_type'] = proj_items[i]['owner']['type']
		proj_item['html_url'] = proj_items[i]['html_url']
		proj_item['stars'] = proj_items[i]['stargazers_count']
		proj_item['forks'] = proj_items[i]['forks_count']
		proj_item['children'] = [] # contributors

		contributors_data = fetchDataFromUrl(genContributorUrl(CONTRIBUTOR_URL, proj_item['repo_id'], CONTRIBUTOR_POSTFIX))
		
		for user in contributors_data: # get all users in that project
			contributor = {}
			contributor['name'] = user['author']['login']
			contributor['user_url'] = user['author']['html_url']
			contributor['commits'] = user['total']
			contributor['size'] = 1 # for visualization purpose

			proj_item['children'].append(contributor)

		project_list['children'].append(proj_item)

	MASTER_LIST['children'].append(project_list)

# write to file
with open('test.json', 'w') as outputfile:
	json.dump(MASTER_LIST, outputfile)