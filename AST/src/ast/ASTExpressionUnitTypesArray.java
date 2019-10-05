package ast;

/**
 * @author Martin
 * This class is mainly in charge of AST node generation of arrays in different types
 * in C/Java programs
 */
public class ASTExpressionUnitTypesArray extends ASTExpressionUnitTypes {
	private static final String NODE_TYPE = "Array Type";
	private int dimension;
	public ASTExpressionUnitTypesArray(){
		super();
	}

	public ASTExpressionUnitTypesArray(String type) {
		super();
		this.type = type;
		this.dimension = 1;
		
	}
	public ASTExpressionUnitTypesArray(String type,int dimension){
		this();
		this.type = type;
		this.dimension = dimension;
	}
	//syntax generation
	public String toSyntax(){
		this.result = this.type;
		for(int i = 0;i<this.dimension;i++){
			this.result+="[]";
		}
		return this.result;
	}
	public String typeof(){
		return super.typeof()+"->"+NODE_TYPE;
	}
}
