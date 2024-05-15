import { CodeBlock } from 'ui'
import Param from '~/components/Params'
import RefSubLayout from '~/layouts/ref/RefSubLayout'
import { Tabs, TabPanel } from '~/components/Tabs'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import BodyContentTypeDropdown from '~/components/BodyContentTypeDropdown'
import { useState } from 'react'

const ApiOperationSection = (props) => {
  const operation = props.spec.operations.find((x: any) => x.operationId === props.funcData.id)
  const bodyContentTypes = Object.keys(operation.requestBody?.content ?? {})
  const [selectedContentType, setSelectedContentType] = useState(bodyContentTypes[0] || '')

  const hasBodyArray =
    operation?.requestBody?.content[selectedContentType]?.schema?.type === 'array'
  const hasBodyArrayObject =
    operation?.requestBody?.content[selectedContentType]?.schema?.items?.type === 'object'

  // gracefully return nothing if function does not exist
  if (!operation) return <></>

  const handleSelectType = (value: string) => {
    setSelectedContentType(value)
  }

  return (
    <RefSubLayout.Section
      key={operation.operationId}
      slug={operation.operationId}
      title={operation.summary}
      id={operation.operationId}
      scrollSpyHeader={true}
      monoFont={false}
    >
      <RefSubLayout.Details>
        <div className="mt-4">
          <code className="text-md flex gap-4 text-md text-foreground-lighter break-all">
            <span
              className="
                uppercase 
                whitespace-nowrap 
                bg-foreground text-background 
                flex items-center justify-center 
                rounded-full font-mono font-medium text-xs px-2 py-0.5"
            >
              {operation.operation}
            </span>
            {operation.path}
          </code>
        </div>
        <div className="prose py-4">
          <p>{operation.description}</p>
        </div>
        {/* Path Parameters */}
        {operation.parameters &&
          operation.parameters.filter((parameter) => parameter.in === 'path').length > 0 && (
            <div className="not-prose mt-12">
              <h5 className="mb-3 text-base text-foreground">Path Parameters</h5>
              <ul className="mt-4">
                {operation.parameters &&
                  operation.parameters
                    .filter((parameter: any) => parameter.in === 'path')
                    .map((parameter: any, index: number) => (
                      <Param
                        key={index}
                        {...parameter}
                        type={parameter.schema.type}
                        isOptional={!parameter.required}
                      ></Param>
                    ))}
              </ul>
            </div>
          )}

        {/* Query Parameters */}
        {operation.parameters &&
          operation.parameters.filter((parameter) => parameter.in === 'query').length > 0 && (
            <div className="not-prose mt-12">
              <h5 className="mb-3 text-base text-foreground">Query Parameters</h5>
              <ul className="mt-4">
                {operation.parameters &&
                  operation.parameters
                    .filter((parameter: any) => parameter.in === 'query')
                    .map((parameter: any, index: number) => (
                      <Param
                        key={index}
                        {...parameter}
                        type={parameter.schema.type}
                        isOptional={!parameter.required}
                      ></Param>
                    ))}
              </ul>
            </div>
          )}

        {/* Header Parameters */}
        {operation.parameters &&
          operation.parameters.filter((parameter) => parameter.in === 'header').length > 0 && (
            <div className="not-prose mt-12">
              <h5 className="mb-3 text-base text-foreground">Header Parameters</h5>
              <ul className="mt-4">
                {operation.parameters &&
                  operation.parameters
                    .filter((parameter: any) => parameter.in === 'header')
                    .map((parameter: any, index) => (
                      <Param
                        key={index}
                        {...parameter}
                        type={parameter.schema.type}
                        isOptional={!parameter.required}
                      ></Param>
                    ))}
              </ul>
            </div>
          )}

        {/* Body */}
        {operation.requestBody && (
          <div className="not-prose mt-12">
            <div className="mb-3 flex flex-row justify-between">
              <h5 className="text-base text-foreground">Body</h5>
              <BodyContentTypeDropdown
                types={Object.keys(operation.requestBody?.content)}
                onSelect={handleSelectType}
              />
            </div>
            <ul className="mt-4">
              {hasBodyArray ? (
                <div className="space-y-4">
                  <span>array of:</span>
                  <div className="ml-10">
                    {hasBodyArrayObject &&
                      operation?.requestBody?.content[selectedContentType]?.schema?.items
                        ?.properties &&
                      Object.entries(
                        operation?.requestBody?.content[selectedContentType]?.schema?.items
                          ?.properties
                      ).map(([key, value]) => (
                        <Param
                          key={key}
                          name={key}
                          {...(value as object)}
                          isOptional={
                            !operation.requestBody?.content[
                              selectedContentType
                            ]?.schema?.items?.required?.includes(key)
                          }
                        ></Param>
                      ))}

                    {!hasBodyArrayObject &&
                      operation?.requestBody?.content[selectedContentType]?.schema?.items?.type && (
                        <Param
                          type={
                            operation?.requestBody?.content[selectedContentType]?.schema?.items
                              ?.type
                          }
                          isPrimitive={true}
                        ></Param>
                      )}
                  </div>
                </div>
              ) : (
                operation?.requestBody?.content[selectedContentType]?.schema?.properties &&
                Object.entries(
                  operation?.requestBody?.content[selectedContentType]?.schema?.properties
                ).map(([key, value]) => (
                  <Param
                    key={key}
                    name={key}
                    {...(value as object)}
                    isOptional={
                      !operation.requestBody?.content[
                        selectedContentType
                      ]?.schema?.required?.includes(key)
                    }
                  ></Param>
                ))
              )}
            </ul>
          </div>
        )}
      </RefSubLayout.Details>
      {operation.responseList && operation.responseList.length > 0 && (
        <RefSubLayout.Examples>
          <h5 className="mb-3 text-base text-foreground">Responses</h5>
          <Tabs
            scrollable
            size="small"
            type="underlined"
            defaultActiveId={operation.responseList[0].responseCode}
            queryGroup="response-status"
          >
            {operation.responseList.map((response: any, i: number) => (
              <TabPanel key={i} id={response.responseCode} label={response.responseCode}>
                <ReactMarkdown className="text-foreground">{response.description}</ReactMarkdown>
                {response?.content && response?.content['application/json'] && (
                  <div className="mt-8">
                    <CodeBlock language="bash" className="relative">
                      {JSON.stringify(response.content['application/json'], null, 2)}
                    </CodeBlock>
                  </div>
                )}
              </TabPanel>
            ))}
          </Tabs>
        </RefSubLayout.Examples>
      )}
    </RefSubLayout.Section>
  )
}
export default ApiOperationSection
